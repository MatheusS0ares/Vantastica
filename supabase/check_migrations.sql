-- Cole isso no SQL Editor do Supabase e rode. Cada linha mostra se a
-- migração correspondente já foi aplicada (true) ou não (false),
-- checando se o objeto/coluna que ela cria já existe no banco.
-- Não altera nada — é só leitura.

select '0001_init' as migration,
  to_regclass('public.organizations') is not null as aplicada
union all
select '0002_guardian_invites',
  exists (select 1 from information_schema.columns
          where table_name = 'guardians' and column_name = 'invite_token')
union all
select '0003_guardian_email_and_notifications',
  exists (select 1 from information_schema.columns
          where table_name = 'guardians' and column_name = 'email')
union all
select '0004_student_photos',
  exists (select 1 from storage.buckets where id = 'student-photos')
union all
select '0005_guardian_photo_edit',
  exists (select 1 from pg_proc where proname = 'update_student_photo_as_guardian')
union all
select '0006_invoices_and_pix',
  exists (select 1 from information_schema.columns
          where table_name = 'organizations' and column_name = 'pix_key')
union all
select '0007_student_expected_times',
  exists (select 1 from information_schema.columns
          where table_name = 'students' and column_name = 'expected_pickup_time')
union all
select '0008_shifts',
  to_regclass('public.student_shifts') is not null
union all
select '0009_organization_invites',
  to_regclass('public.organization_invites') is not null
union all
select '0010_invoices_unique_month',
  exists (select 1 from pg_constraint
          where conname = 'invoices_student_reference_month_key')
union all
select '0011_platform_admin_and_branding',
  to_regclass('public.platform_admins') is not null
union all
select '0012_vehicle_locations',
  to_regclass('public.vehicle_locations') is not null
union all
select '0013_student_shift_sequence',
  exists (select 1 from information_schema.columns
          where table_name = 'student_shifts' and column_name = 'sequence_order')
union all
select '0014_get_user_context_rpc',
  exists (select 1 from pg_proc where proname = 'get_user_context')
order by migration;
