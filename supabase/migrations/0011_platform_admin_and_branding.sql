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
