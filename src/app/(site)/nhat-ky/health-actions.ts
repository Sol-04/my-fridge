"use server";

// Lưu dữ liệu sức khoẻ đã được đọc từ file Apple Sức khoẻ trên máy người dùng. Máy chủ kiểm tra lại mọi số liệu.
import { revalidatePath } from "next/cache";

import { isValidIsoDate, todayInVietnam } from "@/lib/diary";
import { createSupabaseServer } from "@/lib/supabase/server";

import type { DiaryResult } from "./actions";

const NOT_READY = "Hệ thống lưu trữ đang tạm thời chưa sẵn sàng. Bạn đợi một chút rồi thử lại nhé.";
const SAVE_FAILED = "Chưa lưu được. Có thể mạng đang chậm, bạn thử lại sau ít phút nhé.";
const MAX_DAYS = 420;
const MAX_CYCLES = 40;

type Session =
  | { ok: true; supabase: NonNullable<Awaited<ReturnType<typeof createSupabaseServer>>>; userId: string }
  | { ok: false; result: DiaryResult };

async function session(): Promise<Session> {
  const supabase = await createSupabaseServer();
  if (!supabase) return { ok: false, result: { ok: false, error: NOT_READY } };
  try {
    const user = (await supabase.auth.getUser()).data.user;
    if (!user) return { ok: false, result: { ok: false, error: "Bạn cần đăng nhập để lưu dữ liệu sức khoẻ.", needLogin: true } };
    return { ok: true, supabase, userId: user.id };
  } catch {
    return { ok: false, result: { ok: false, error: NOT_READY } };
  }
}

const done = (): DiaryResult => {
  revalidatePath("/nhat-ky");
  return { ok: true };
};

const intIn = (v: unknown, max: number): number | null | undefined => {
  if (v == null) return null;
  const n = Math.round(Number(v));
  return Number.isFinite(n) && n >= 0 && n <= max ? n : undefined; // undefined = không hợp lệ
};

export async function importHealthSummary(input: {
  days: { day: string; steps: number | null; activeKcal: number | null }[];
  cycles: { start: string; end: string }[];
}): Promise<DiaryResult> {
  if (!Array.isArray(input?.days) || !Array.isArray(input?.cycles) || input.days.length > MAX_DAYS || input.cycles.length > MAX_CYCLES) {
    return { ok: false, error: "Dữ liệu quá lớn hoặc chưa đúng dạng. Bạn thử xuất lại file từ app Sức khoẻ nhé." };
  }
  const today = todayInVietnam();
  const days = new Map<string, { day: string; steps: number | null; active_kcal: number | null }>();
  for (const d of input.days) {
    const steps = intIn(d?.steps, 200000);
    const kcal = intIn(d?.activeKcal, 20000);
    if (!isValidIsoDate(d?.day) || d.day > today || steps === undefined || kcal === undefined) continue; // bỏ dòng lạ, không báo lỗi cả file
    days.set(d.day, { day: d.day, steps, active_kcal: kcal });
  }
  const cycles = new Map<string, { start_date: string; end_date: string }>();
  for (const c of input.cycles) {
    if (!isValidIsoDate(c?.start) || !isValidIsoDate(c?.end) || c.start > today || c.end < c.start) continue;
    if (Date.parse(c.end) - Date.parse(c.start) > 15 * 86_400_000) continue;
    cycles.set(c.start, { start_date: c.start, end_date: c.end });
  }
  if (days.size === 0 && cycles.size === 0) return { ok: false, error: "Trong file chưa thấy số bước chân, năng lượng hoạt động hay chu kỳ nào." };

  const s = await session();
  if (!s.ok) return s.result;
  const base = { user_id: s.userId, source: "apple_health" };
  if (days.size) {
    const { error } = await s.supabase
      .from("health_daily")
      .upsert([...days.values()].map((d) => ({ ...base, ...d, updated_at: new Date().toISOString() })), { onConflict: "user_id,day" });
    if (error) {
      console.error("Lưu sức khoẻ ngày lỗi:", error.message);
      return { ok: false, error: SAVE_FAILED };
    }
  }
  if (cycles.size) {
    // Không ghi đè kỳ người dùng tự nhập: chỉ upsert dòng có nguồn apple_health
    const { data: manual } = await s.supabase.from("cycle_logs").select("start_date").eq("source", "manual");
    const skip = new Set((manual ?? []).map((m: { start_date: string }) => m.start_date));
    const rows = [...cycles.values()].filter((c) => !skip.has(c.start_date)).map((c) => ({ ...base, ...c }));
    if (rows.length) {
      const { error } = await s.supabase.from("cycle_logs").upsert(rows, { onConflict: "user_id,start_date" });
      if (error) {
        console.error("Lưu chu kỳ lỗi:", error.message);
        return { ok: false, error: SAVE_FAILED };
      }
    }
  }
  return done();
}

export async function addCycleStart(date: string): Promise<DiaryResult> {
  if (!isValidIsoDate(date) || date > todayInVietnam()) return { ok: false, error: "Ngày bắt đầu chưa hợp lệ (không chọn ngày trong tương lai)." };
  const s = await session();
  if (!s.ok) return s.result;
  const { error } = await s.supabase
    .from("cycle_logs")
    .upsert({ user_id: s.userId, start_date: date, end_date: null, source: "manual" }, { onConflict: "user_id,start_date" });
  if (error) {
    console.error("Ghi chu kỳ lỗi:", error.message);
    return { ok: false, error: SAVE_FAILED };
  }
  return done();
}

export async function deleteCycle(id: string): Promise<DiaryResult> {
  if (typeof id !== "string" || id.length > 64) return { ok: false, error: "Không tìm thấy kỳ này." };
  const s = await session();
  if (!s.ok) return s.result;
  const { error } = await s.supabase.from("cycle_logs").delete().eq("id", id);
  if (error) {
    console.error("Xoá chu kỳ lỗi:", error.message);
    return { ok: false, error: SAVE_FAILED };
  }
  return done();
}

// Xoá toàn bộ dữ liệu sức khoẻ của mình (quyền riêng tư)
export async function deleteAllHealthData(): Promise<DiaryResult> {
  const s = await session();
  if (!s.ok) return s.result;
  const a = await s.supabase.from("health_daily").delete().eq("user_id", s.userId);
  const b = await s.supabase.from("cycle_logs").delete().eq("user_id", s.userId);
  if (a.error || b.error) {
    console.error("Xoá dữ liệu sức khoẻ lỗi:", (a.error ?? b.error)?.message);
    return { ok: false, error: SAVE_FAILED };
  }
  return done();
}
