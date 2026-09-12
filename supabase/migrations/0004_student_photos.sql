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
