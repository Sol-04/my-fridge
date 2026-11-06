// Đọc dữ liệu sức khoẻ của người đang đăng nhập (chạy ở máy chủ). RLS bảo đảm chỉ đọc được dòng của chính mình.
import "server-only";

import type { SupabaseClient } from "@supabase/supabase-js";

import { addDays } from "@/lib/diary";

export type HealthDayRow = { day: string; steps: number | null; active_kcal: number | null };
export type CycleRow = { id: string; start_date: string; end_date: string | null; source: string };
export type HealthData = { week: HealthDayRow[]; cycles: CycleRow[] } | null; // null = đọc lỗi

export async function getHealthData(supabase: SupabaseClient, userId: string, date: string): Promise<HealthData> {
  try {
    const [week, cycles] = await Promise.all([
      supabase.from("health_daily").select("day, steps, active_kcal").eq("user_id", userId).gte("day", addDays(date, -6)).lte("day", date).order("day"),
      supabase.from("cycle_logs").select("id, start_date, end_date, source").eq("user_id", userId).order("start_date", { ascending: false }).limit(12),
    ]);
    if (week.error || cycles.error) {
      console.error("Không đọc được dữ liệu sức khoẻ:", (week.error ?? cycles.error)?.message);
      return null;
    }
    return { week: week.data as HealthDayRow[], cycles: cycles.data as CycleRow[] };
  } catch (err) {
    console.error("Không đọc được dữ liệu sức khoẻ:", err instanceof Error ? err.message : err);
    return null;
  }
}
