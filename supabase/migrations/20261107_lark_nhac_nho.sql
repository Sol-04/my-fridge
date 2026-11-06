-- NHẮC NHỞ QUA LARK: uống nước, vận động, ăn uống (chạy theo giờ trong Supabase). Chỉ THÊM, không đụng bảng cũ.
-- Cảnh báo quá calo được gửi từ web ngay khi ghi món (không nằm trong file này).
-- Link webhook của bot Lark là BÍ MẬT: bảng có RLS (chỉ chủ tài khoản), hàm gửi chỉ chạy trong cơ sở dữ liệu.

create extension if not exists pg_net with schema extensions;
create extension if not exists pg_cron;

create table if not exists public.lark_settings (
  user_id      uuid primary key default auth.uid() references auth.users (id) on delete cascade,
  webhook_url  text not null,
  enabled      boolean not null default true,
  water_on     boolean not null default true,
  move_on      boolean not null default true,
  meal_on      boolean not null default true,
  calorie_on   boolean not null default true,
  updated_at   timestamptz not null default now(),
  -- Chỉ nhận link bot của Lark / Feishu, tránh bị lợi dụng gửi tới địa chỉ lạ
  constraint lark_webhook_valid check (webhook_url ~ '^https://(open\.larksuite\.com|open\.feishu\.cn)/open-apis/bot/v2/hook/[A-Za-z0-9-]{20,60}$')
);
comment on table public.lark_settings is 'Cài đặt nhắc nhở Lark của từng người: link webhook bot (bí mật) + loại nhắc nào được bật.';

alter table public.lark_settings enable row level security;
revoke all on table public.lark_settings from anon, authenticated;
grant select, insert, update, delete on table public.lark_settings to authenticated;

drop policy if exists "Xem cài đặt Lark của mình" on public.lark_settings;
create policy "Xem cài đặt Lark của mình" on public.lark_settings for select to authenticated using ((select auth.uid()) = user_id);
drop policy if exists "Thêm cài đặt Lark của mình" on public.lark_settings;
create policy "Thêm cài đặt Lark của mình" on public.lark_settings for insert to authenticated with check ((select auth.uid()) = user_id);
drop policy if exists "Sửa cài đặt Lark của mình" on public.lark_settings;
create policy "Sửa cài đặt Lark của mình" on public.lark_settings for update to authenticated
  using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
drop policy if exists "Xoá cài đặt Lark của mình" on public.lark_settings;
create policy "Xoá cài đặt Lark của mình" on public.lark_settings for delete to authenticated using ((select auth.uid()) = user_id);

-- Gửi nhắc theo giờ Việt Nam. Chạy mỗi 30 phút (xem lịch ở cuối); khớp giờ nào thì gửi tin của giờ đó.
create or replace function public.send_lark_reminders()
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  now_vn text := to_char(now() at time zone 'Asia/Ho_Chi_Minh', 'HH24:MI');
  s record;
begin
  for s in
    select * from (values
      ('07:00', 'meal',  '[Glow up] Chào buổi sáng! Đến giờ ăn sáng rồi, nhớ ghi bữa sáng vào Nhật ký nhé.'),
      ('11:30', 'meal',  '[Glow up] Đến giờ ăn trưa rồi. Ăn chậm, nhiều rau, rồi ghi vào Nhật ký nhé.'),
      ('18:30', 'meal',  '[Glow up] Đến giờ ăn tối rồi. Ăn vừa đủ, đừng quên ghi vào Nhật ký nhé.'),
      ('08:00', 'water', '[Glow up] Uống một cốc nước (khoảng 250 ml) nhé!'),
      ('10:00', 'water', '[Glow up] Đến giờ uống nước rồi, một cốc nhé!'),
      ('12:00', 'water', '[Glow up] Nhớ uống nước, một cốc nhé!'),
      ('14:00', 'water', '[Glow up] Uống nước nào, đừng để khát mới uống!'),
      ('16:00', 'water', '[Glow up] Một cốc nước giúp bạn tỉnh táo buổi chiều đấy.'),
      ('18:00', 'water', '[Glow up] Uống một cốc nước trước bữa tối nhé!'),
      ('20:00', 'water', '[Glow up] Cốc nước cuối ngày, nhưng đừng uống quá sát giờ ngủ nhé.'),
      ('09:30', 'move',  '[Glow up] Đứng dậy vươn vai, đi bộ vài phút nhé!'),
      ('15:30', 'move',  '[Glow up] Nghỉ tay 5 phút: đi lại và duỗi người nào!'),
      ('17:30', 'move',  '[Glow up] Đến giờ vận động rồi. 20 đến 30 phút đi bộ nhanh là đủ nhé!')
    ) as v(slot, kind, msg)
    where v.slot = now_vn
  loop
    perform net.http_post(
      url     := l.webhook_url,
      body    := jsonb_build_object('msg_type', 'text', 'content', jsonb_build_object('text', s.msg)),
      headers := '{"Content-Type": "application/json"}'::jsonb
    )
    from public.lark_settings l
    where l.enabled
      and case s.kind
            when 'water' then l.water_on
            when 'move'  then l.move_on
            when 'meal'  then l.meal_on
            else false
          end;
  end loop;
end;
$$;

-- Chỉ hệ thống hẹn giờ được chạy hàm này, người dùng / khách không gọi được
revoke all on function public.send_lark_reminders() from public, anon, authenticated;

-- Lịch: phút 0 và 30 mỗi giờ (giờ Việt Nam lệch đúng số giờ nguyên so với UTC nên khớp)
select cron.unschedule(jobid) from cron.job where jobname = 'glowup-lark-reminders';
select cron.schedule('glowup-lark-reminders', '0,30 * * * *', 'select public.send_lark_reminders()');
