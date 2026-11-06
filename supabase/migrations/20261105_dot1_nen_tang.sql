-- ĐỢT 1 — Nền tảng (chỉ THÊM, không xoá / đổi tên bảng hay cột nào)
-- Database thật đang chạy sau code: chưa có bảng profiles, chưa có meal_plans.user_id.
-- File này đưa database khớp với supabase/schema.sql + thêm ngày sinh vào hồ sơ.

-- 1) Bảng hồ sơ (mỗi tài khoản 1 dòng) + RLS: chỉ chủ xem / tạo / sửa hồ sơ của mình
create table if not exists public.profiles (
  id            uuid primary key references auth.users (id) on delete cascade,
  display_name  text,
  gender        text,
  age           integer,
  height_cm     integer,
  weight_kg     numeric(5, 1),
  activity      text,
  goal          text,
  updated_at    timestamptz not null default now(),

  constraint profiles_display_name_len check (display_name is null or char_length(display_name) between 1 and 60),
  constraint profiles_gender_valid     check (gender is null or gender in ('female', 'male')),
  constraint profiles_age_range        check (age is null or age between 15 and 100),
  constraint profiles_height_range     check (height_cm is null or height_cm between 120 and 220),
  constraint profiles_weight_range     check (weight_kg is null or weight_kg between 30 and 250),
  constraint profiles_activity_valid   check (activity is null or activity in ('sedentary', 'light', 'moderate', 'active')),
  constraint profiles_goal_valid       check (goal is null or goal in ('lose', 'maintain', 'gain'))
);

comment on table public.profiles is 'Hồ sơ người dùng: tên hiển thị + thông tin cơ thể để tự điền khi tạo thực đơn.';

alter table public.profiles enable row level security;

-- Khách (anon) không đụng được vào hồ sơ. Người đăng nhập chỉ xem / tạo / sửa (không xoá).
revoke all on table public.profiles from anon, authenticated;
grant select, insert, update on table public.profiles to authenticated;

drop policy if exists "Xem hồ sơ của mình" on public.profiles;
create policy "Xem hồ sơ của mình"
  on public.profiles for select
  to authenticated
  using ((select auth.uid()) = id);

drop policy if exists "Tạo hồ sơ của mình" on public.profiles;
create policy "Tạo hồ sơ của mình"
  on public.profiles for insert
  to authenticated
  with check ((select auth.uid()) = id);

drop policy if exists "Sửa hồ sơ của mình" on public.profiles;
create policy "Sửa hồ sơ của mình"
  on public.profiles for update
  to authenticated
  using ((select auth.uid()) = id)
  with check ((select auth.uid()) = id);

-- Tự tạo hồ sơ khi có tài khoản mới (lấy tên hiển thị người dùng nhập lúc đăng ký).
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (id, display_name)
  values (
    new.id,
    nullif(left(trim(coalesce(new.raw_user_meta_data ->> 'display_name', '')), 60), '')
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

revoke all on function public.handle_new_user() from public, anon, authenticated;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- 2) Ngày sinh (dùng để tự tính tuổi). Giữ cột age cũ, không xoá.
alter table public.profiles
  add column if not exists birth_date date;
alter table public.profiles drop constraint if exists profiles_birth_date_range;
alter table public.profiles
  add constraint profiles_birth_date_range check (birth_date is null or birth_date between date '1920-01-01' and date '2015-12-31');

-- 3) Tạo sẵn hồ sơ trống cho tài khoản đã có từ trước (trigger chỉ chạy với tài khoản mới)
insert into public.profiles (id)
select id from auth.users
on conflict (id) do nothing;

-- 4) Thực đơn: thêm chủ sở hữu (user_id) + RLS: phải đăng nhập mới lưu, chỉ xem danh sách của mình.
--    Thực đơn cũ (lưu trước khi có đăng nhập) để user_id trống, vẫn xem được qua link (hàm get_meal_plan giữ nguyên).
-- Chủ của thực đơn (để trống với các thực đơn lưu trước khi có đăng nhập)
alter table public.meal_plans
  add column if not exists user_id uuid references auth.users (id) on delete set null default auth.uid();

create index if not exists meal_plans_user_created_idx on public.meal_plans (user_id, created_at desc);

comment on table public.meal_plans is 'Thực đơn đã lưu. Chỉ người đăng nhập được thêm; chủ xem được danh sách của mình; ai có id xem qua get_meal_plan(id).';

alter table public.meal_plans enable row level security;

-- Quyền cơ bản: khách KHÔNG được thêm. Người đăng nhập được thêm + xem (RLS giới hạn của chính mình).
-- Không ai được sửa hay xoá.
revoke all on table public.meal_plans from anon, authenticated;
grant select, insert on table public.meal_plans to authenticated;

-- Bỏ quy tắc cũ (trước đây ai cũng được thêm)
drop policy if exists "Ai cũng được thêm thực đơn" on public.meal_plans;

drop policy if exists "Người đăng nhập thêm thực đơn của mình" on public.meal_plans;
create policy "Người đăng nhập thêm thực đơn của mình"
  on public.meal_plans for insert
  to authenticated
  with check ((select auth.uid()) = user_id);

drop policy if exists "Xem danh sách thực đơn của mình" on public.meal_plans;
create policy "Xem danh sách thực đơn của mình"
  on public.meal_plans for select
  to authenticated
  using ((select auth.uid()) = user_id);

