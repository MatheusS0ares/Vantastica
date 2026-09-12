-- Horários previstos de busca/entrega por aluno, usados para comparar
-- com os check-ins reais e sinalizar atraso no relatório individual.
alter table students
  add column expected_pickup_time time,
  add column expected_dropoff_time time;
