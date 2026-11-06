// Đọc nhật ký của người đang đăng nhập (chạy ở máy chủ). RLS của Supabase bảo đảm chỉ đọc được dòng của chính mình.
import "server-only";

import type { SupabaseClient } from "@supabase/supabase-js";

import type { FoodLog, WorkoutLog, WorkoutPlanRow } from "@/lib/diary";

export type DiaryDay = {
  foods: FoodLog[] | null; // null = đọc lỗi
  workouts: WorkoutLog[] | null;
  plan: WorkoutPlanRow | null;
};

export async function getDiaryDay(supabase: SupabaseClient, userId: string, date: string): Promise<DiaryDay> {
  const safe = <T,>(p: PromiseLike<{ data: T | null; error: { message: string } | null }>, what: string) =>
    Promise.resolve(p).then(
      (r) => {
        if (r.error) console.error(`Không đọc được ${what}:`, r.error.message);
        return r.error ? null : r.data;
      },
      (err) => {
        console.error(`Không đọc được ${what}:`, err instanceof Error ? err.message : err);
        return null;
      },
    );

  const [foods, workouts, plan] = await Promise.all([
    safe(
      supabase
        .from("food_logs")
        .select("id, log_date, meal, recipe_slug, name, servings, calories, protein, carbs, fat")
        .eq("user_id", userId)
        .eq("log_date", date)
        .order("created_at"),
      "nhật ký ăn",
    ),
    safe(
      supabase
        .from("workout_logs")
        .select("id, log_date, activity_key, name, minutes, calories")
        .eq("user_id", userId)
        .eq("log_date", date)
        .order("created_at"),
      "nhật ký tập",
    ),
    safe(supabase.from("workout_plans").select("goal, level, favorite_activities").eq("user_id", userId).maybeSingle(), "kế hoạch tập"),
  ]);

  const num = (v: unknown) => (v == null ? null : Number(v));
  return {
    foods: foods
      ? (foods as FoodLog[]).map((f) => ({ ...f, servings: Number(f.servings), protein: num(f.protein), carbs: num(f.carbs), fat: num(f.fat) }))
      : null,
    workouts: workouts as WorkoutLog[] | null,
    plan: (plan as WorkoutPlanRow | null) ?? null,
  };
}
