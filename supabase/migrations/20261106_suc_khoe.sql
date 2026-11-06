-- DỮ LIỆU SỨC KHOẺ (bước chân, năng lượng hoạt động, chu kỳ) — chỉ THÊM bảng mới.
-- Chạy SAU 20261105_nhat_ky.sql. Mỗi bảng có user_id + RLS: chỉ chủ tài khoản xem / thêm / sửa / xoá dòng của mình.

create table if not exists public.health_daily (
  user_id      uuid not null default auth.uid() references auth.users (id) on delete cascade,
  day          date not null,
  steps        integer,
  active_kcal  integer,
  source       text not null default 'apple_health',
  updated_at   timestamptz not null default now(),
  primary key (user_id, day),
  constraint health_daily_day_range  check (day between date '2020-01-01' and date '2100-01-01'),
  constraint health_daily_steps     check (steps is null or steps between 0 and 200000),
  constraint health_daily_kcal      check (active_kcal is null or active_kcal between 0 and 20000),
  constraint health_daily_source    check (source in ('apple_health', 'manual'))
);
comment on table public.health_daily is 'Bước chân + năng lượng hoạt động mỗi ngày (nhập từ file Apple Sức khoẻ hoặc tự nhập).';

create table if not exists public.cycle_logs (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null default auth.uid() references auth.users (id) on delete cascade,
  start_date  date not null,
  end_date    date,
  source      text not null default 'apple_health',
  created_at  timestamptz not null default now(),
  unique (user_id, start_date),
  constraint cycle_logs_start_range check (start_date between date '2020-01-01' and date '2100-01-01'),
  constraint cycle_logs_end_valid   check (end_date is null or (end_date >= start_date and end_date <= start_date + 15)),
  constraint cycle_logs_source      check (source in ('apple_health', 'manual'))
);
comment on table public.cycle_logs is 'Các kỳ kinh nguyệt: ngày bắt đầu (và kết thúc nếu có).';

alter table public.health_daily enable row level security;
alter table public.cycle_logs   enable row level security;
revoke all on table public.health_daily, public.cycle_logs from anon, authenticated;
grant select, insert, update, delete on table public.health_daily, public.cycle_logs to authenticated;

drop policy if exists "Xem sức khoẻ ngày của mình" on public.health_daily;
create policy "Xem sức khoẻ ngày của mình" on public.health_daily for select to authenticated using ((select auth.uid()) = user_id);
drop policy if exists "Thêm sức khoẻ ngày của mình" on public.health_daily;
create policy "Thêm sức khoẻ ngày của mình" on public.health_daily for insert to authenticated with check ((select auth.uid()) = user_id);
drop policy if exists "Sửa sức khoẻ ngày của mình" on public.health_daily;
create policy "Sửa sức khoẻ ngày của mình" on public.health_daily for update to authenticated
  using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
drop policy if exists "Xoá sức khoẻ ngày của mình" on public.health_daily;
create policy "Xoá sức khoẻ ngày của mình" on public.health_daily for delete to authenticated using ((select auth.uid()) = user_id);

drop policy if exists "Xem chu kỳ của mình" on public.cycle_logs;
create policy "Xem chu kỳ của mình" on public.cycle_logs for select to authenticated using ((select auth.uid()) = user_id);
drop policy if exists "Thêm chu kỳ của mình" on public.cycle_logs;
create policy "Thêm chu kỳ của mình" on public.cycle_logs for insert to authenticated with check ((select auth.uid()) = user_id);
drop policy if exists "Sửa chu kỳ của mình" on public.cycle_logs;
create policy "Sửa chu kỳ của mình" on public.cycle_logs for update to authenticated
  using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
drop policy if exists "Xoá chu kỳ của mình" on public.cycle_logs;
create policy "Xoá chu kỳ của mình" on public.cycle_logs for delete to authenticated using ((select auth.uid()) = user_id);
