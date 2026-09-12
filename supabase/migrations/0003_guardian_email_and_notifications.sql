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
