-- =============================================================
-- My Fridge — cơ sở dữ liệu (Supabase)
-- Cách chạy: Supabase → SQL Editor → dán TOÀN BỘ file này → Run.
-- Chạy lại nhiều lần cũng an toàn (dùng "if not exists" / "or replace" / "drop ... if exists").
-- =============================================================


-- =============================================================
-- PHẦN A — HỒ SƠ NGƯỜI DÙNG (profiles)
-- Mỗi tài khoản có 1 hồ sơ. Chỉ chủ tài khoản được xem / sửa hồ sơ của mình.
-- =============================================================

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


-- =============================================================
-- PHẦN B — THỰC ĐƠN ĐÃ LƯU (meal_plans)
-- Phải đăng nhập mới lưu được. Ai có link (id) vẫn xem được qua hàm get_meal_plan.
-- =============================================================

create table if not exists public.meal_plans (
  id               uuid primary key default gen_random_uuid(),
  created_at       timestamptz not null default now(),
  -- Thông tin người dùng nhập: giới tính, tuổi, chiều cao, cân nặng, mức vận động, mục tiêu
  user_input       jsonb not null,
  -- Calo mục tiêu mỗi ngày
  target_calories  integer not null,
  -- Thực phẩm người dùng đã chọn ở bước 2
  selected_foods   text[] not null default '{}',
  -- Món và khẩu phần của từng bữa, dạng:
  -- {recipe_id, slug, name, servings, calories_per_serving, total_calories, protein, carbs, fat}
  breakfast        jsonb,
  lunch            jsonb,
  dinner           jsonb,

  -- Giới hạn để tránh dữ liệu rác
  constraint meal_plans_target_calories_range check (target_calories between 800 and 6000),
  constraint meal_plans_user_input_object     check (jsonb_typeof(user_input) = 'object'
                                                     and pg_column_size(user_input) < 2000),
  constraint meal_plans_selected_foods_size   check (cardinality(selected_foods) <= 100),
  constraint meal_plans_breakfast_object      check (breakfast is null or (jsonb_typeof(breakfast) = 'object'
                                                     and pg_column_size(breakfast) < 2000)),
  constraint meal_plans_lunch_object          check (lunch is null or (jsonb_typeof(lunch) = 'object'
                                                     and pg_column_size(lunch) < 2000)),
  constraint meal_plans_dinner_object         check (dinner is null or (jsonb_typeof(dinner) = 'object'
                                                     and pg_column_size(dinner) < 2000))
);

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

-- Xem 1 thực đơn THEO ID (ai có link đều xem được, kể cả khách) — dùng cho link chia sẻ.
-- Không cho phép "select" cả bảng với khách để không ai tải được thực đơn của người khác.
create or replace function public.get_meal_plan(plan_id uuid)
returns setof public.meal_plans
language sql
stable
security definer
set search_path = ''
as $$
  select * from public.meal_plans where id = plan_id limit 1;
$$;

revoke all on function public.get_meal_plan(uuid) from public;
grant execute on function public.get_meal_plan(uuid) to anon, authenticated;
