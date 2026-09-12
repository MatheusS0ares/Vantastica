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
