-- "MÓN CỦA TÔI": món ăn + calo do người dùng tự thêm, lưu để dùng lại trong Nhật ký. Chỉ THÊM bảng mới.
-- RLS: mỗi người chỉ xem / thêm / sửa / xoá món của chính mình; khách không đụng được.

create table if not exists public.custom_foods (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null default auth.uid() references auth.users (id) on delete cascade,
  name        text not null,
  calories    integer not null,          -- calo cho 1 phần
  protein     numeric(6, 1),
  carbs       numeric(6, 1),
  fat         numeric(6, 1),
  created_at  timestamptz not null default now(),
  constraint custom_foods_name_len check (char_length(name) between 1 and 120),
  constraint custom_foods_calories  check (calories between 0 and 5000),
  constraint custom_foods_macros    check ((protein is null or protein between 0 and 500)
                                       and (carbs is null or carbs between 0 and 1000)
                                       and (fat is null or fat between 0 and 500))
);
create index if not exists custom_foods_user_idx on public.custom_foods (user_id, created_at desc);
comment on table public.custom_foods is 'Món ăn do người dùng tự thêm (calo cho 1 phần), dùng lại trong Nhật ký.';

-- Mỗi người tối đa 100 món (chặn ngay trong cơ sở dữ liệu, không chỉ ở web)
create or replace function public.custom_foods_limit()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if (select count(*) from public.custom_foods where user_id = new.user_id) >= 100 then
    raise exception 'custom_foods_limit' using errcode = 'P0001';
  end if;
  return new;
end;
$$;
drop trigger if exists custom_foods_limit_trg on public.custom_foods;
create trigger custom_foods_limit_trg before insert on public.custom_foods for each row execute function public.custom_foods_limit();

alter table public.custom_foods enable row level security;
revoke all on table public.custom_foods from anon, authenticated;
grant select, insert, update, delete on table public.custom_foods to authenticated;

drop policy if exists "Xem món của mình" on public.custom_foods;
create policy "Xem món của mình" on public.custom_foods for select to authenticated using ((select auth.uid()) = user_id);
drop policy if exists "Thêm món của mình" on public.custom_foods;
create policy "Thêm món của mình" on public.custom_foods for insert to authenticated with check ((select auth.uid()) = user_id);
drop policy if exists "Sửa món của mình" on public.custom_foods;
create policy "Sửa món của mình" on public.custom_foods for update to authenticated
  using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
drop policy if exists "Xoá món của mình" on public.custom_foods;
create policy "Xoá món của mình" on public.custom_foods for delete to authenticated using ((select auth.uid()) = user_id);
