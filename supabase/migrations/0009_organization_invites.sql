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
