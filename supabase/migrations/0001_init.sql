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
