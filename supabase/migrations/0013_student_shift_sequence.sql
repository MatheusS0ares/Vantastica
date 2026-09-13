-- Sequência de paradas dentro de um turno (em que ordem o motorista
-- visita cada aluno). Fica direto em student_shifts, já que cada linha
-- ali já representa "esse aluno anda nesse turno" — não precisa da
-- estrutura routes/route_stops de 0001, que nunca chegou a ser usada e
-- não conhece os turnos matutino/vespertino/noturno atuais.
alter table student_shifts
  add column if not exists sequence_order int;
