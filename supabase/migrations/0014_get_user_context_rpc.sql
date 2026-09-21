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
