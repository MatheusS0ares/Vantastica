-- ═══════════════════════════════════════════════════════════════════════
-- SCHEMA COMPLETO DO VANTÁSTICA — todas as migrations (0001 a 0015)
-- juntas num arquivo só, na ordem certa.
--
-- ⚠️  RODE ISSO SÓ NUM PROJETO SUPABASE NOVO/VAZIO (ex.: um ambiente de
-- teste, ou se um dia precisar recriar o banco do zero). Se o seu banco
-- JÁ tem alguma dessas migrations aplicadas, rodar este arquivo inteiro
-- vai falhar com erro de "já existe" na primeira tabela/policy que já
-- estiver criada — e para no meio, sem terminar.
--
-- Pra saber se seu banco já tem tudo aplicado, rode antes
-- `supabase/check_migrations.sql` no SQL Editor.
--
-- No dia a dia (banco que já está em uso), continue rodando os arquivos
-- de `supabase/migrations/` um por um, só os que aparecerem como
-- pendentes — é assim que o projeto evolui sem perder histórico do que
-- já foi aplicado quando.
-- ═══════════════════════════════════════════════════════════════════════

-- =======================================================================
-- 0001_init.sql
-- =======================================================================
-- VemVan — schema inicial multi-tenant
-- Cada van/empresa é uma "organization" (tenant). Todo dado operacional
-- (alunos, rotas, financeiro) é isolado por organization_id via RLS.

create extension if not exists "pgcrypto";

-- ---------------------------------------------------------------------
-- Organizações (tenants) e membros
-- ---------------------------------------------------------------------

create table organizations (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  phone text,
  created_at timestamptz not null default now()
);

create type org_role as enum ('owner', 'driver');

create table organization_members (
  organization_id uuid not null references organizations (id) on delete cascade,
  user_id uuid not null references auth.users (id) on delete cascade,
  role org_role not null default 'owner',
  created_at timestamptz not null default now(),
  primary key (organization_id, user_id)
);

-- Função auxiliar: o usuário logado pertence a essa organização?
create function is_org_member(org_id uuid)
returns boolean
language sql
security definer
stable
set search_path = public
as $$
  select exists (
    select 1 from organization_members
    where organization_id = org_id and user_id = auth.uid()
  );
$$;

-- Bootstrap de uma nova organização: nenhuma policy de INSERT é criada em
-- organizations/organization_members de propósito (RLS bloqueia insert
-- direto). Esta função roda como security definer para criar a org e já
-- inserir o criador como "owner" atomicamente, evitando o problema do
-- "ovo e a galinha" (não dá pra virar membro sem já ser membro).
create function create_organization(org_name text, org_phone text default null)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  new_org_id uuid;
begin
  insert into organizations (name, phone) values (org_name, org_phone)
  returning id into new_org_id;

  insert into organization_members (organization_id, user_id, role)
  values (new_org_id, auth.uid(), 'owner');

  return new_org_id;
end;
$$;

grant execute on function create_organization(text, text) to authenticated;

-- ---------------------------------------------------------------------
-- Alunos, responsáveis e vínculos
-- ---------------------------------------------------------------------

create table students (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references organizations (id) on delete cascade,
  full_name text not null,
  photo_url text,
  school_name text,
  class_name text,
  pickup_address text,
  dropoff_address text,
  medical_notes text,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

create table guardians (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users (id) on delete set null,
  created_by uuid references auth.users (id) default auth.uid(),
  full_name text not null,
  phone text,
  created_at timestamptz not null default now()
);

create table student_guardians (
  student_id uuid not null references students (id) on delete cascade,
  guardian_id uuid not null references guardians (id) on delete cascade,
  relationship text, -- ex.: "Mãe", "Pai", "Avó"
  is_primary_contact boolean not null default false,
  can_pick_up boolean not null default false,
  primary key (student_id, guardian_id)
);

-- Função auxiliar: o usuário logado é responsável por esse aluno?
create function is_student_guardian(sid uuid)
returns boolean
language sql
security definer
stable
set search_path = public
as $$
  select exists (
    select 1
    from student_guardians sg
    join guardians g on g.id = sg.guardian_id
    where sg.student_id = sid and g.user_id = auth.uid()
  );
$$;

-- ---------------------------------------------------------------------
-- Rotas e paradas
-- ---------------------------------------------------------------------

create type route_shift as enum ('manha', 'tarde');
create type route_direction as enum ('ida', 'volta');

create table routes (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references organizations (id) on delete cascade,
  name text not null,
  shift route_shift not null,
  direction route_direction not null,
  created_at timestamptz not null default now()
);

create table route_stops (
  id uuid primary key default gen_random_uuid(),
  route_id uuid not null references routes (id) on delete cascade,
  student_id uuid not null references students (id) on delete cascade,
  sequence_order int not null,
  estimated_time time
);

-- ---------------------------------------------------------------------
-- Check-ins (embarque / entrega / ausência) — dispara notificações
-- ---------------------------------------------------------------------

create type checkin_event as enum ('embarque', 'entrega', 'ausente');

create table checkins (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null references students (id) on delete cascade,
  route_id uuid references routes (id) on delete set null,
  event_type checkin_event not null,
  notes text,
  recorded_by uuid references auth.users (id),
  occurred_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------
-- Financeiro
-- ---------------------------------------------------------------------

create type invoice_status as enum ('pendente', 'pago', 'atrasado');

create table invoices (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references organizations (id) on delete cascade,
  student_id uuid not null references students (id) on delete cascade,
  reference_month date not null, -- primeiro dia do mês de referência
  amount_cents int not null,
  due_date date not null,
  status invoice_status not null default 'pendente',
  paid_at timestamptz,
  created_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------
-- Ocorrências e calendário letivo
-- ---------------------------------------------------------------------

create table incidents (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references organizations (id) on delete cascade,
  student_id uuid references students (id) on delete cascade,
  title text not null,
  description text,
  created_by uuid references auth.users (id),
  created_at timestamptz not null default now()
);

create type calendar_event_type as enum ('feriado', 'recesso', 'prova', 'sem_transporte');

create table school_calendar_events (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references organizations (id) on delete cascade,
  event_date date not null,
  title text not null,
  event_type calendar_event_type not null
);

-- ---------------------------------------------------------------------
-- Row Level Security
-- ---------------------------------------------------------------------

alter table organizations enable row level security;
alter table organization_members enable row level security;
alter table students enable row level security;
alter table guardians enable row level security;
alter table student_guardians enable row level security;
alter table routes enable row level security;
alter table route_stops enable row level security;
alter table checkins enable row level security;
alter table invoices enable row level security;
alter table incidents enable row level security;
alter table school_calendar_events enable row level security;

-- organizations: membros veem/editam a própria organização
create policy "org members can view" on organizations
  for select using (is_org_member(id));
create policy "org members can update" on organizations
  for update using (is_org_member(id));

-- organization_members: membros da organização se enxergam entre si
create policy "org members can view roster" on organization_members
  for select using (is_org_member(organization_id));

-- students: motoristas da organização têm acesso completo; responsáveis
-- só enxergam os alunos vinculados a eles
create policy "org members manage students" on students
  for all using (is_org_member(organization_id));
create policy "guardians view their students" on students
  for select using (is_student_guardian(id));

-- guardians: qualquer membro de alguma organização pode cadastrar um
-- contato (ex.: motorista cadastrando os pais no dossiê do aluno); depois
-- de vinculado via student_guardians, só a organização do aluno e o
-- próprio responsável enxergam/editam o registro
create policy "org members can create guardians" on guardians
  for insert with check (
    exists (select 1 from organization_members where user_id = auth.uid())
  );
create policy "org members view linked guardians" on guardians
  for select using (
    exists (
      select 1 from student_guardians sg
      join students s on s.id = sg.student_id
      where sg.guardian_id = guardians.id and is_org_member(s.organization_id)
    )
  );
create policy "org members update linked guardians" on guardians
  for update using (
    exists (
      select 1 from student_guardians sg
      join students s on s.id = sg.student_id
      where sg.guardian_id = guardians.id and is_org_member(s.organization_id)
    )
  );
create policy "guardians view self" on guardians
  for select using (user_id = auth.uid());
create policy "guardians update self" on guardians
  for update using (user_id = auth.uid());
-- Sem isso, um INSERT com RETURNING (o que o client Supabase faz por
-- padrão ao usar .select() após .insert()) falha: a policy de INSERT
-- permite criar o contato, mas antes de ele ser vinculado a um aluno
-- (student_guardians) nenhuma outra policy de SELECT o tornaria visível,
-- e o Postgres rejeita devolver uma linha que a policy de leitura esconde.
create policy "creator can view guardians they just created" on guardians
  for select using (created_by = auth.uid());

-- student_guardians: mesma regra de visibilidade dos alunos
create policy "org members manage student_guardians" on student_guardians
  for all using (
    exists (
      select 1 from students s
      where s.id = student_guardians.student_id and is_org_member(s.organization_id)
    )
  );
create policy "guardians view own links" on student_guardians
  for select using (is_student_guardian(student_id));

-- routes / route_stops: só a organização dona da rota
create policy "org members manage routes" on routes
  for all using (is_org_member(organization_id));
create policy "org members manage route_stops" on route_stops
  for all using (
    exists (
      select 1 from routes r
      where r.id = route_stops.route_id and is_org_member(r.organization_id)
    )
  );
create policy "guardians view stops of their students" on route_stops
  for select using (is_student_guardian(student_id));

-- checkins: motoristas da organização registram; responsáveis só leem os
-- check-ins do próprio filho (é isso que alimenta a notificação/status)
create policy "org members manage checkins" on checkins
  for all using (
    exists (
      select 1 from students s
      where s.id = checkins.student_id and is_org_member(s.organization_id)
    )
  );
create policy "guardians view their student checkins" on checkins
  for select using (is_student_guardian(student_id));

-- invoices: organização gerencia; responsável só lê a fatura do próprio filho
create policy "org members manage invoices" on invoices
  for all using (is_org_member(organization_id));
create policy "guardians view their invoices" on invoices
  for select using (is_student_guardian(student_id));

-- incidents: organização gerencia; responsável só lê ocorrências do próprio filho
create policy "org members manage incidents" on incidents
  for all using (is_org_member(organization_id));
create policy "guardians view their incidents" on incidents
  for select using (student_id is not null and is_student_guardian(student_id));

-- school_calendar_events: visível para todos os membros da organização e
-- para responsáveis com pelo menos um filho na organização
create policy "org members manage calendar" on school_calendar_events
  for all using (is_org_member(organization_id));
create policy "guardians view calendar" on school_calendar_events
  for select using (
    exists (
      select 1 from students s
      where s.organization_id = school_calendar_events.organization_id
        and is_student_guardian(s.id)
    )
  );

-- =======================================================================
-- 0002_guardian_invites.sql
-- =======================================================================
-- Convite de responsável por token, em vez de vincular por telefone
-- (que permitiria "sequestrar" o cadastro de outra família só sabendo o
-- número). O motorista cadastra o responsável (guardians.invite_token é
-- gerado automaticamente) e compartilha o link /convite/<token> por
-- WhatsApp; a claim só acontece com o token exato e uma única vez.

alter table guardians
  add column invite_token uuid not null default gen_random_uuid();

create unique index guardians_invite_token_idx on guardians (invite_token);

create function claim_guardian_invite(token uuid)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
declare
  matched_id uuid;
begin
  update guardians
  set user_id = auth.uid()
  where invite_token = token and user_id is null
  returning id into matched_id;

  return matched_id is not null;
end;
$$;

grant execute on function claim_guardian_invite(uuid) to authenticated;

-- =======================================================================
-- 0003_guardian_email_and_notifications.sql
-- =======================================================================
-- Guarda o e-mail do responsável no momento em que ele reivindica o
-- convite (copiado de auth.users, que só a função, como security
-- definer, consegue enxergar) — evita ter que chamar a Admin API do
-- Supabase toda vez que for mandar uma notificação de check-in.

alter table guardians add column email text;

create or replace function claim_guardian_invite(token uuid)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
declare
  matched_id uuid;
  claimer_email text;
begin
  select email into claimer_email from auth.users where id = auth.uid();

  update guardians
  set user_id = auth.uid(), email = claimer_email
  where invite_token = token and user_id is null
  returning id into matched_id;

  return matched_id is not null;
end;
$$;

-- =======================================================================
-- 0004_student_photos.sql
-- =======================================================================
-- Bucket privado pra fotos de aluno. Fica privado (não público) porque
-- são fotos de crianças — acesso só via signed URL, gerada sob demanda
-- pra quem tem permissão (mesma checagem de organização de sempre).

insert into storage.buckets (id, name, public)
values ('student-photos', 'student-photos', false)
on conflict (id) do nothing;

-- Convenção de path: "<organization_id>/<algo único>.jpg" — a policy
-- lê o primeiro segmento do caminho como o organization_id e reusa
-- is_org_member, a mesma função de sempre.

create policy "org members can upload student photos"
on storage.objects for insert
with check (
  bucket_id = 'student-photos'
  and is_org_member(((storage.foldername(name))[1])::uuid)
);

create policy "org members can view student photos"
on storage.objects for select
using (
  bucket_id = 'student-photos'
  and is_org_member(((storage.foldername(name))[1])::uuid)
);

create policy "org members can update student photos"
on storage.objects for update
using (
  bucket_id = 'student-photos'
  and is_org_member(((storage.foldername(name))[1])::uuid)
);

create policy "org members can delete student photos"
on storage.objects for delete
using (
  bucket_id = 'student-photos'
  and is_org_member(((storage.foldername(name))[1])::uuid)
);

-- =======================================================================
-- 0005_guardian_photo_edit.sql
-- =======================================================================
-- Permite ao responsável trocar a foto do próprio filho, sem abrir
-- UPDATE geral na tabela students pra ele (só a foto, via função
-- restrita, no mesmo padrão do create_organization/claim_guardian_invite).

create function update_student_photo_as_guardian(sid uuid, new_photo_url text)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
begin
  if not is_student_guardian(sid) then
    return false;
  end if;

  update students set photo_url = new_photo_url where id = sid;
  return true;
end;
$$;

grant execute on function update_student_photo_as_guardian(uuid, text) to authenticated;

-- O caminho das fotos passa a ser "<organization_id>/<student_id>/<arquivo>"
-- (antes era só "<organization_id>/<arquivo>"), pra essas policies
-- conseguirem restringir por aluno. Fotos já existentes no formato
-- antigo continuam acessíveis pra organização (a policy de motorista
-- de baixo não muda) — só não ficam visíveis ao responsável até serem
-- re-enviadas no novo formato.

create policy "guardians can upload their student's photo"
on storage.objects for insert
with check (
  bucket_id = 'student-photos'
  and is_student_guardian(((storage.foldername(name))[2])::uuid)
);

create policy "guardians can view their student's photo"
on storage.objects for select
using (
  bucket_id = 'student-photos'
  and is_student_guardian(((storage.foldername(name))[2])::uuid)
);

create policy "guardians can update their student's photo"
on storage.objects for update
using (
  bucket_id = 'student-photos'
  and is_student_guardian(((storage.foldername(name))[2])::uuid)
);

-- =======================================================================
-- 0006_invoices_and_pix.sql
-- =======================================================================
-- Chave PIX da organização, exibida pro responsável na aba financeira.
alter table organizations add column pix_key text;

-- organizations hoje só é visível pra quem já é membro dela (o
-- motorista). O responsável precisa enxergar o nome da van e a chave
-- PIX da organização do(s) aluno(s) que ele acompanha.
create policy "guardians can view their student's organization" on organizations
  for select using (
    exists (
      select 1 from students s
      where s.organization_id = organizations.id and is_student_guardian(s.id)
    )
  );

-- =======================================================================
-- 0007_student_expected_times.sql
-- =======================================================================
-- Horários previstos de busca/entrega por aluno, usados para comparar
-- com os check-ins reais e sinalizar atraso no relatório individual.
alter table students
  add column expected_pickup_time time,
  add column expected_dropoff_time time;

-- =======================================================================
-- 0008_shifts.sql
-- =======================================================================
-- Suporte a múltiplos turnos por aluno (ex.: matutino ida pra escola +
-- vespertino volta pra casa). Substitui os horários previstos fixos que
-- tinham sido adicionados direto em `students` (0007) por um turno por
-- linha, já que um aluno pode ter horários e turnos diferentes no mesmo
-- dia (e nem todo aluno usa todos os turnos).

create type shift_period as enum ('matutino', 'vespertino', 'noturno');

create table student_shifts (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null references students (id) on delete cascade,
  shift shift_period not null,
  expected_pickup_time time,
  expected_dropoff_time time,
  created_at timestamptz not null default now(),
  unique (student_id, shift)
);

alter table student_shifts enable row level security;

-- Mesma regra de visibilidade de checkins: organização do aluno gerencia,
-- responsável só lê os turnos do próprio filho.
create policy "org members manage student_shifts" on student_shifts
  for all using (
    exists (
      select 1 from students s
      where s.id = student_shifts.student_id and is_org_member(s.organization_id)
    )
  );
create policy "guardians view their student shifts" on student_shifts
  for select using (is_student_guardian(student_id));

-- Cada check-in agora pertence a um turno específico do dia (nulo pros
-- registros antigos, de antes dessa migration).
alter table checkins add column shift shift_period;

-- Os horários previstos viram por turno, em student_shifts.
alter table students drop column expected_pickup_time;
alter table students drop column expected_dropoff_time;

-- =======================================================================
-- 0009_organization_invites.sql
-- =======================================================================
-- Convite de motorista/ajudante adicional pra mesma organização. Mesmo
-- padrão de invite_token usado pros responsáveis: token único, claim via
-- RPC security definer, pra fugir do "ovo e a galinha" de RLS (quem
-- ainda não é membro não pode nem ler a organização pra se auto-inserir).

create table organization_invites (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references organizations (id) on delete cascade,
  invite_token uuid not null default gen_random_uuid(),
  role org_role not null default 'driver',
  created_by uuid references auth.users (id),
  claimed_by uuid references auth.users (id),
  claimed_at timestamptz,
  created_at timestamptz not null default now()
);

create unique index organization_invites_token_idx on organization_invites (invite_token);

alter table organization_invites enable row level security;

create policy "org members manage invites" on organization_invites
  for all using (is_org_member(organization_id));

create function claim_organization_invite(token uuid)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  matched organization_invites;
begin
  select * into matched from organization_invites
  where invite_token = token and claimed_by is null;

  if matched.id is null then
    return null;
  end if;

  insert into organization_members (organization_id, user_id, role)
  values (matched.organization_id, auth.uid(), matched.role);

  update organization_invites
  set claimed_by = auth.uid(), claimed_at = now()
  where id = matched.id;

  return matched.organization_id;
end;
$$;

grant execute on function claim_organization_invite(uuid) to authenticated;

-- =======================================================================
-- 0010_invoices_unique_month.sql
-- =======================================================================
-- Evita mensalidade duplicada pro mesmo aluno no mesmo mês — necessário
-- pra geração em lote (todos os alunos ativos de uma vez) ser
-- idempotente: rodar de novo no mesmo mês não duplica quem já tem fatura.
alter table invoices
  add constraint invoices_student_reference_month_key unique (student_id, reference_month);

-- =======================================================================
-- 0011_platform_admin_and_branding.sql
-- =======================================================================
-- Perfil de admin da plataforma (o dono do VemVan): consegue "entrar
-- como" qualquer motorista pra dar suporte, sem precisar da senha dele.
-- A autorização real continua sendo via RLS — is_org_member() passa a
-- aceitar também platform_admins, então o admin herda o mesmo acesso de
-- um membro real de QUALQUER organização, sem precisar tocar em cada
-- policy do schema individualmente (quase todas já passam por essa
-- função central).
--
-- Virar admin não é self-service — só é possível inserindo direto na
-- tabela pelo SQL Editor (ver instruções depois de rodar essa migration).

create table platform_admins (
  user_id uuid primary key references auth.users (id) on delete cascade,
  created_at timestamptz not null default now()
);

alter table platform_admins enable row level security;

create policy "users can check their own admin status" on platform_admins
  for select using (user_id = auth.uid());

create function is_platform_admin()
returns boolean
language sql
security definer
stable
set search_path = public
as $$
  select exists (select 1 from platform_admins where user_id = auth.uid());
$$;

create or replace function is_org_member(org_id uuid)
returns boolean
language sql
security definer
stable
set search_path = public
as $$
  select
    exists (
      select 1 from organization_members
      where organization_id = org_id and user_id = auth.uid()
    )
    or is_platform_admin();
$$;

-- Única policy do schema que checa "é membro de alguma organização" sem
-- passar por is_org_member() (o cadastro de um responsável não tem um
-- organization_id fixo antes de vincular) — precisa do OR explícito pro
-- admin também poder cadastrar responsável enquanto impersona.
drop policy if exists "org members can create guardians" on guardians;
create policy "org members can create guardians" on guardians
  for insert with check (
    exists (select 1 from organization_members where user_id = auth.uid())
    or is_platform_admin()
  );

-- ---------------------------------------------------------------------
-- Detalhes da van + identidade visual da organização
-- ---------------------------------------------------------------------

alter table organizations
  add column if not exists van_plate text,
  add column if not exists van_model text,
  add column if not exists van_capacity int,
  add column if not exists van_photo_url text,
  add column if not exists logo_url text;

-- Bucket público (logo e foto da van não são dados sensíveis — servir
-- direto por URL pública evita ficar gerenciando expiração de URL
-- assinada só pra mostrar a marca da empresa).
insert into storage.buckets (id, name, public)
values ('org-assets', 'org-assets', true)
on conflict (id) do update set public = true;

create policy "org members manage org assets" on storage.objects
  for all using (
    bucket_id = 'org-assets'
    and is_org_member(((storage.foldername(name))[1])::uuid)
  );

-- =======================================================================
-- 0012_vehicle_locations.sql
-- =======================================================================
-- Localização ao vivo da van: uma linha por organização, sempre
-- sobrescrita com a posição mais recente (não é histórico/trilha, só
-- "onde a van está agora"). O motorista atualiza enquanto compartilha
-- localização na Rota de Hoje; o responsável lê pra mostrar no mapa.

create table vehicle_locations (
  organization_id uuid primary key references organizations (id) on delete cascade,
  latitude double precision not null,
  longitude double precision not null,
  updated_at timestamptz not null default now()
);

alter table vehicle_locations enable row level security;

create policy "org members manage vehicle location" on vehicle_locations
  for all using (is_org_member(organization_id));

create policy "guardians view their student's vehicle location" on vehicle_locations
  for select using (
    exists (
      select 1 from students s
      where s.organization_id = vehicle_locations.organization_id
        and is_student_guardian(s.id)
    )
  );

-- =======================================================================
-- 0013_student_shift_sequence.sql
-- =======================================================================
-- Sequência de paradas dentro de um turno (em que ordem o motorista
-- visita cada aluno). Fica direto em student_shifts, já que cada linha
-- ali já representa "esse aluno anda nesse turno" — não precisa da
-- estrutura routes/route_stops de 0001, que nunca chegou a ser usada e
-- não conhece os turnos matutino/vespertino/noturno atuais.
alter table student_shifts
  add column if not exists sequence_order int;

-- =======================================================================
-- 0014_get_user_context_rpc.sql
-- =======================================================================
-- getUserContext() fazia até 3 idas-e-voltas SEQUENCIAIS ao banco em
-- toda navegação (platform_admins -> organization_members ->
-- guardians), fora uma consulta separada a organizations no layout do
-- motorista. Cada ida-e-volta é uma latência de rede inteira (ainda
-- mais alta se o projeto do Supabase estiver numa região diferente da
-- Vercel) — isso empilhado é a causa mais provável da navegação lenta.
--
-- Essa função junta as três checagens (é admin? é motorista de qual
-- org? é responsável?) e já traz nome/logo da organização, tudo numa
-- única chamada RPC (1 round-trip em vez de até 4). Sempre retorna
-- exatamente uma linha (a subconsulta "u" garante isso), então o
-- client pode usar .maybeSingle() com segurança.
create or replace function get_user_context()
returns table (
  is_admin boolean,
  organization_id uuid,
  organization_name text,
  organization_logo_url text,
  guardian_id uuid
)
language sql
security definer
stable
set search_path = public
as $$
  select
    exists (
      select 1 from platform_admins where user_id = u.uid
    ) as is_admin,
    om.organization_id,
    org.name as organization_name,
    org.logo_url as organization_logo_url,
    g.id as guardian_id
  from (select auth.uid() as uid) u
  left join lateral (
    select organization_id
    from organization_members
    where user_id = u.uid
    order by created_at asc
    limit 1
  ) om on true
  left join organizations org on org.id = om.organization_id
  left join lateral (
    select id from guardians where user_id = u.uid limit 1
  ) g on true;
$$;

grant execute on function get_user_context() to authenticated;

-- =======================================================================
-- 0015_get_user_context_van_photo.sql
-- =======================================================================
-- Estende get_user_context() (migration 0014) pra também trazer a foto
-- da van, usada pra desenhar a marca d'água de fundo em toda tela do
-- motorista e do responsável — sem isso, o layout precisaria de uma
-- consulta extra em toda navegação só pra buscar essa foto.
--
-- Pro motorista, vem direto da própria organização. Pro responsável,
-- vem da organização do primeiro aluno vinculado (a grande maioria só
-- tem filhos numa van só).
--
-- Postgres não deixa trocar as colunas de retorno de uma função
-- "returns table" via CREATE OR REPLACE — precisa derrubar a função
-- antes de recriar com as colunas novas.
drop function if exists get_user_context();

create function get_user_context()
returns table (
  is_admin boolean,
  organization_id uuid,
  organization_name text,
  organization_logo_url text,
  organization_van_photo_url text,
  guardian_id uuid,
  guardian_van_photo_url text
)
language sql
security definer
stable
set search_path = public
as $$
  select
    exists (
      select 1 from platform_admins where user_id = u.uid
    ) as is_admin,
    om.organization_id,
    org.name as organization_name,
    org.logo_url as organization_logo_url,
    org.van_photo_url as organization_van_photo_url,
    g.id as guardian_id,
    gv.van_photo_url as guardian_van_photo_url
  from (select auth.uid() as uid) u
  left join lateral (
    select organization_id
    from organization_members
    where user_id = u.uid
    order by created_at asc
    limit 1
  ) om on true
  left join organizations org on org.id = om.organization_id
  left join lateral (
    select id from guardians where user_id = u.uid limit 1
  ) g on true
  left join lateral (
    select og.van_photo_url
    from student_guardians sg
    join students s on s.id = sg.student_id
    join organizations og on og.id = s.organization_id
    where sg.guardian_id = g.id
    limit 1
  ) gv on true;
$$;

grant execute on function get_user_context() to authenticated;
