// Đọc thực đơn đã lưu từ Supabase (qua hàm get_meal_plan — phải biết đúng id).
import { cacheLife } from "next/cache";

import type { MealEntry, UserInput } from "@/lib/meal-plan";
import { getSupabase } from "@/lib/supabase";

export type SavedMealPlan = {
  id: string;
  created_at: string;
  user_input: UserInput;
  target_calories: number;
  selected_foods: string[];
  breakfast: MealEntry | null;
  lunch: MealEntry | null;
  dinner: MealEntry | null;
};

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
export const isUuid = (s: string) => UUID_RE.test(s);

// Thực đơn đã lưu không bao giờ thay đổi → lưu tạm (cache) nhiều ngày.
// Lỗi kết nối sẽ "ném lỗi" để KHÔNG bị lưu tạm; chỉ "không tìm thấy" mới trả về null.
async function fetchMealPlanCached(id: string): Promise<SavedMealPlan | null> {
  "use cache";
  cacheLife("days");
  const supabase = getSupabase();
  if (!supabase) throw new Error("Chưa cấu hình Supabase");
  const { data, error } = await supabase.rpc("get_meal_plan", { plan_id: id });
  if (error) throw new Error(error.message);
  const rows = (data ?? []) as SavedMealPlan[];
  return rows[0] ?? null;
}

export type MealPlanResult =
  | { status: "ok"; plan: SavedMealPlan }
  | { status: "not-found" }
  | { status: "error" };

export async function getMealPlan(id: string): Promise<MealPlanResult> {
  if (!isUuid(id)) return { status: "not-found" };
  try {
    const plan = await fetchMealPlanCached(id.toLowerCase());
    return plan ? { status: "ok", plan } : { status: "not-found" };
  } catch (err) {
    console.error("Không đọc được thực đơn:", err instanceof Error ? err.message : err);
    return { status: "error" };
  }
}
