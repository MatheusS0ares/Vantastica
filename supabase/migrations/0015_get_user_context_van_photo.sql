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
