-- Localização ao vivo da van: uma linha por organização, sempre
-- sobrescrita com a posição mais recente (não é histórico/trilha, só
-- "onde a van está agora"). O motorista atualiza enquanto compartilha
-- localização na Rota de Hoje; o responsável lê pra mostrar no mapa.

create table vehicle_locations (
  organization_id uuid primary key references organizations (id) on delete cascade,
  latitude double precision not null,
  longitude double precision not null,
  updated_at timestamptz not null default now()
);

alter table vehicle_locations enable row level security;

create policy "org members manage vehicle location" on vehicle_locations
  for all using (is_org_member(organization_id));

create policy "guardians view their student's vehicle location" on vehicle_locations
  for select using (
    exists (
      select 1 from students s
      where s.organization_id = vehicle_locations.organization_id
        and is_student_guardian(s.id)
    )
  );
