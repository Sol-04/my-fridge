-- NHẬT KÝ ĂN UỐNG + TẬP LUYỆN (chỉ THÊM bảng mới, không đụng bảng cũ)
-- Chạy SAU file 20261105_dot1_nen_tang.sql.
-- Mỗi bảng có user_id + RLS: người đăng nhập chỉ xem / thêm / sửa / xoá dòng CỦA MÌNH. Khách (anon) không đụng được.

-- 1) Món đã ăn trong ngày
create table if not exists public.food_logs (
  id           uuid primary key default gen_random_uuid(),
  user_id      uuid not null default auth.uid() references auth.users (id) on delete cascade,
  log_date     date not null,
  meal         text not null,
  recipe_slug  text,                      -- món có sẵn trên web; trống nếu người dùng tự nhập
  name         text not null,
  servings     numeric(4, 2) not null default 1,
  calories     integer not null,
  protein      numeric(6, 1),
  carbs        numeric(6, 1),
  fat          numeric(6, 1),
  created_at   timestamptz not null default now(),
  constraint food_logs_date_range   check (log_date between date '2020-01-01' and date '2100-01-01'),
  constraint food_logs_meal_valid   check (meal in ('breakfast', 'lunch', 'dinner', 'snack')),
  constraint food_logs_slug_len     check (recipe_slug is null or char_length(recipe_slug) <= 120),
  constraint food_logs_name_len     check (char_length(name) between 1 and 120),
  constraint food_logs_servings     check (servings > 0 and servings <= 10),
  constraint food_logs_calories     check (calories between 0 and 5000),
  constraint food_logs_macros       check ((protein is null or protein between 0 and 500)
                                       and (carbs is null or carbs between 0 and 1000)
                                       and (fat is null or fat between 0 and 500))
);
create index if not exists food_logs_user_date_idx on public.food_logs (user_id, log_date);
comment on table public.food_logs is 'Nhật ký ăn uống: mỗi dòng là 1 món đã ăn trong 1 bữa của 1 ngày.';

-- 2) Kế hoạch tập của mỗi người (1 dòng / người): mục tiêu + trình độ + môn yêu thích
create table if not exists public.workout_plans (
  user_id              uuid primary key default auth.uid() references auth.users (id) on delete cascade,
  goal                 text not null,
  level                text not null,
  favorite_activities  text[] not null default '{}',
  updated_at           timestamptz not null default now(),
  constraint workout_plans_goal_valid  check (goal in ('lose_fat', 'build_muscle', 'healthy')),
  constraint workout_plans_level_valid check (level in ('beginner', 'intermediate', 'advanced')),
  constraint workout_plans_fav_size    check (cardinality(favorite_activities) <= 20)
);
comment on table public.workout_plans is 'Thiết lập tập luyện: mục tiêu, trình độ, môn thể thao yêu thích.';

-- 3) Buổi tập / hoạt động đã làm trong ngày
create table if not exists public.workout_logs (
  id            uuid primary key default gen_random_uuid(),
  user_id       uuid not null default auth.uid() references auth.users (id) on delete cascade,
  log_date      date not null,
  activity_key  text,                     -- hoạt động trong thư viện; trống nếu tự nhập
  name          text not null,
  minutes       integer not null,
  calories      integer not null,
  created_at    timestamptz not null default now(),
  constraint workout_logs_date_range check (log_date between date '2020-01-01' and date '2100-01-01'),
  constraint workout_logs_key_len    check (activity_key is null or char_length(activity_key) <= 60),
  constraint workout_logs_name_len   check (char_length(name) between 1 and 120),
  constraint workout_logs_minutes    check (minutes between 1 and 600),
  constraint workout_logs_calories   check (calories between 0 and 5000)
);
create index if not exists workout_logs_user_date_idx on public.workout_logs (user_id, log_date);
comment on table public.workout_logs is 'Nhật ký tập luyện: mỗi dòng là 1 hoạt động đã làm trong 1 ngày.';

-- 4) Quyền + RLS (giống nhau cho 3 bảng)
alter table public.food_logs     enable row level security;
alter table public.workout_plans enable row level security;
alter table public.workout_logs  enable row level security;

revoke all on table public.food_logs, public.workout_plans, public.workout_logs from anon, authenticated;
grant select, insert, update, delete on table public.food_logs, public.workout_logs to authenticated;
grant select, insert, update on table public.workout_plans to authenticated;

drop policy if exists "Xem nhật ký ăn của mình" on public.food_logs;
create policy "Xem nhật ký ăn của mình" on public.food_logs for select to authenticated using ((select auth.uid()) = user_id);
drop policy if exists "Thêm nhật ký ăn của mình" on public.food_logs;
create policy "Thêm nhật ký ăn của mình" on public.food_logs for insert to authenticated with check ((select auth.uid()) = user_id);
drop policy if exists "Sửa nhật ký ăn của mình" on public.food_logs;
create policy "Sửa nhật ký ăn của mình" on public.food_logs for update to authenticated
  using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
drop policy if exists "Xoá nhật ký ăn của mình" on public.food_logs;
create policy "Xoá nhật ký ăn của mình" on public.food_logs for delete to authenticated using ((select auth.uid()) = user_id);

drop policy if exists "Xem kế hoạch tập của mình" on public.workout_plans;
create policy "Xem kế hoạch tập của mình" on public.workout_plans for select to authenticated using ((select auth.uid()) = user_id);
drop policy if exists "Tạo kế hoạch tập của mình" on public.workout_plans;
create policy "Tạo kế hoạch tập của mình" on public.workout_plans for insert to authenticated with check ((select auth.uid()) = user_id);
drop policy if exists "Sửa kế hoạch tập của mình" on public.workout_plans;
create policy "Sửa kế hoạch tập của mình" on public.workout_plans for update to authenticated
  using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);

drop policy if exists "Xem nhật ký tập của mình" on public.workout_logs;
create policy "Xem nhật ký tập của mình" on public.workout_logs for select to authenticated using ((select auth.uid()) = user_id);
drop policy if exists "Thêm nhật ký tập của mình" on public.workout_logs;
create policy "Thêm nhật ký tập của mình" on public.workout_logs for insert to authenticated with check ((select auth.uid()) = user_id);
drop policy if exists "Sửa nhật ký tập của mình" on public.workout_logs;
create policy "Sửa nhật ký tập của mình" on public.workout_logs for update to authenticated
  using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
drop policy if exists "Xoá nhật ký tập của mình" on public.workout_logs;
create policy "Xoá nhật ký tập của mình" on public.workout_logs for delete to authenticated using ((select auth.uid()) = user_id);
