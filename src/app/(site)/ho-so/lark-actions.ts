"use server";

// Cài đặt nhắc nhở Lark. Link webhook là bí mật: chỉ lưu / đọc ở máy chủ, không bao giờ trả về trình duyệt.
import { revalidatePath } from "next/cache";

import { isLarkWebhook, sendLarkText } from "@/lib/lark";
import { createSupabaseServer } from "@/lib/supabase/server";

export type LarkResult = { ok: true; message?: string } | { ok: false; error: string };
export type LarkInput = { webhookUrl: string; enabled: boolean; water: boolean; move: boolean; meal: boolean; calorie: boolean };

const NOT_READY = "Hệ thống đang tạm thời chưa sẵn sàng. Bạn thử lại sau ít phút nhé.";
const FAILED = "Chưa lưu được. Có thể mạng đang chậm, bạn thử lại sau ít phút nhé.";

type Session =
  | { ok: true; supabase: NonNullable<Awaited<ReturnType<typeof createSupabaseServer>>>; userId: string }
  | { ok: false; error: string };

async function session(): Promise<Session> {
  const supabase = await createSupabaseServer();
  if (!supabase) return { ok: false, error: NOT_READY };
  try {
    const user = (await supabase.auth.getUser()).data.user;
    if (!user) return { ok: false, error: "Phiên đăng nhập đã hết hạn. Bạn đăng nhập lại nhé." };
    return { ok: true, supabase, userId: user.id };
  } catch {
    return { ok: false, error: NOT_READY };
  }
}

export async function saveLarkSettings(input: LarkInput): Promise<LarkResult> {
  const url = String(input?.webhookUrl ?? "").trim();
  const flags = { enabled: !!input?.enabled, water_on: !!input?.water, move_on: !!input?.move, meal_on: !!input?.meal, calorie_on: !!input?.calorie };
  const s = await session();
  if (!s.ok) return s;

  if (url) {
    if (!isLarkWebhook(url)) return { ok: false, error: "Link chưa đúng. Link bot Lark bắt đầu bằng https://open.larksuite.com/open-apis/bot/v2/hook/… Bạn copy lại cả link nhé." };
    const { error } = await s.supabase.from("lark_settings").upsert({ user_id: s.userId, webhook_url: url, ...flags, updated_at: new Date().toISOString() }, { onConflict: "user_id" });
    if (error) {
      console.error("Lưu cài đặt Lark lỗi:", error.message);
      return { ok: false, error: FAILED };
    }
  } else {
    // Không nhập link mới → chỉ đổi các công tắc, giữ link cũ
    const { data, error } = await s.supabase.from("lark_settings").update({ ...flags, updated_at: new Date().toISOString() }).eq("user_id", s.userId).select("user_id");
    if (error) {
      console.error("Sửa cài đặt Lark lỗi:", error.message);
      return { ok: false, error: FAILED };
    }
    if (!data?.length) return { ok: false, error: "Bạn dán link webhook của bot Lark vào ô trên trước nhé." };
  }
  revalidatePath("/ho-so");
  return { ok: true, message: "Đã lưu cài đặt nhắc nhở." };
}

export async function sendLarkTest(): Promise<LarkResult> {
  const s = await session();
  if (!s.ok) return s;
  const { data, error } = await s.supabase.from("lark_settings").select("webhook_url").eq("user_id", s.userId).maybeSingle();
  if (error) return { ok: false, error: FAILED };
  if (!data) return { ok: false, error: "Bạn lưu link webhook trước rồi mới gửi thử nhé." };
  const res = await sendLarkText(data.webhook_url, "[Glow up] Kết nối Lark thành công! Từ giờ bạn sẽ nhận nhắc uống nước, vận động, ăn uống và cảnh báo calo tại đây.");
  return res.ok ? { ok: true, message: "Đã gửi tin thử. Bạn kiểm tra nhóm Lark nhé." } : res;
}

export async function removeLark(): Promise<LarkResult> {
  const s = await session();
  if (!s.ok) return s;
  const { error } = await s.supabase.from("lark_settings").delete().eq("user_id", s.userId);
  if (error) {
    console.error("Xoá cài đặt Lark lỗi:", error.message);
    return { ok: false, error: FAILED };
  }
  revalidatePath("/ho-so");
  return { ok: true, message: "Đã ngắt kết nối Lark và xoá link webhook." };
}
