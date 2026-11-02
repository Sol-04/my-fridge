-- =============================================================
-- My Fridge — bảng lưu thực đơn (meal_plans)
-- Cách chạy: Supabase → SQL Editor → dán toàn bộ file này → Run.
-- Chạy lại nhiều lần cũng an toàn.
-- =============================================================

-- 1) Bảng lưu thực đơn
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

comment on table public.meal_plans is 'Thực đơn người dùng đã lưu. Chỉ thêm mới; xem qua hàm get_meal_plan(id).';

-- 2) Bật Row Level Security (quy tắc ai được làm gì với từng dòng)
alter table public.meal_plans enable row level security;

-- Quyền cơ bản: khách (anon) và người đăng nhập chỉ được THÊM MỚI.
-- Không được xem cả bảng, không được sửa, không được xoá.
revoke all on table public.meal_plans from anon, authenticated;
grant insert on table public.meal_plans to anon, authenticated;

-- Quy tắc duy nhất: ai cũng được thêm mới.
-- (Không có quy tắc select/update/delete → không ai đọc thẳng bảng, sửa hay xoá được.)
drop policy if exists "Ai cũng được thêm thực đơn" on public.meal_plans;
create policy "Ai cũng được thêm thực đơn"
  on public.meal_plans
  for insert
  to anon, authenticated
  with check (true);

-- 3) Xem 1 thực đơn THEO ID (phải biết đúng id mới xem được).
-- Dùng hàm thay vì cho phép "select" để không ai tải được toàn bộ thực đơn của mọi người.
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
