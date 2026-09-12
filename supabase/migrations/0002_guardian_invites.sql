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
