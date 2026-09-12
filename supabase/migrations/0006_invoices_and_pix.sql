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
