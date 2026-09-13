-- Evita mensalidade duplicada pro mesmo aluno no mesmo mês — necessário
-- pra geração em lote (todos os alunos ativos de uma vez) ser
-- idempotente: rodar de novo no mesmo mês não duplica quem já tem fatura.
alter table invoices
  add constraint invoices_student_reference_month_key unique (student_id, reference_month);
