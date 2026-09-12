-- Suporte a múltiplos turnos por aluno (ex.: matutino ida pra escola +
-- vespertino volta pra casa). Substitui os horários previstos fixos que
-- tinham sido adicionados direto em `students` (0007) por um turno por
-- linha, já que um aluno pode ter horários e turnos diferentes no mesmo
-- dia (e nem todo aluno usa todos os turnos).

create type shift_period as enum ('matutino', 'vespertino', 'noturno');

create table student_shifts (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null references students (id) on delete cascade,
  shift shift_period not null,
  expected_pickup_time time,
  expected_dropoff_time time,
  created_at timestamptz not null default now(),
  unique (student_id, shift)
);

alter table student_shifts enable row level security;

-- Mesma regra de visibilidade de checkins: organização do aluno gerencia,
-- responsável só lê os turnos do próprio filho.
create policy "org members manage student_shifts" on student_shifts
  for all using (
    exists (
      select 1 from students s
      where s.id = student_shifts.student_id and is_org_member(s.organization_id)
    )
  );
create policy "guardians view their student shifts" on student_shifts
  for select using (is_student_guardian(student_id));

-- Cada check-in agora pertence a um turno específico do dia (nulo pros
-- registros antigos, de antes dessa migration).
alter table checkins add column shift shift_period;

-- Os horários previstos viram por turno, em student_shifts.
alter table students drop column expected_pickup_time;
alter table students drop column expected_dropoff_time;
