// Cảnh báo calo gửi tới Lark ngay khi ghi món (chạy ở máy chủ, dùng phiên đăng nhập của chính người dùng nên RLS vẫn áp dụng).
import "server-only";

import type { SupabaseClient } from "@supabase/supabase-js";

import { todayInVietnam } from "@/lib/diary";
import { isLarkWebhook } from "@/lib/lark";
import { calcTargetCalories, parseUserInput } from "@/lib/meal-plan";
import { getProfile } from "@/lib/profile";

export type CalorieAlert = { url: string; text: string };

// Trả về tin cần gửi nếu món vừa ghi làm tổng ngày VƯỢT 100% (hoặc chạm 90%) lần đầu; ngược lại trả null (không gửi lặp).
export async function buildCalorieAlert(supabase: SupabaseClient, userId: string, date: string, addedCalories: number): Promise<CalorieAlert | null> {
  try {
    if (date !== todayInVietnam()) return null;
    const { data: lark } = await supabase.from("lark_settings").select("webhook_url, enabled, calorie_on").eq("user_id", userId).maybeSingle();
    if (!lark || !lark.enabled || !lark.calorie_on || !isLarkWebhook(lark.webhook_url)) return null;

    const profile = await getProfile(supabase, userId);
    const input = profile
      ? parseUserInput({ gender: profile.gender, age: profile.age, heightCm: profile.height_cm, weightKg: profile.weight_kg, activity: profile.activity, goal: profile.goal })
      : null;
    if (!input) return null;
    const target = calcTargetCalories(input);

    const [foods, workouts] = await Promise.all([
      supabase.from("food_logs").select("calories").eq("user_id", userId).eq("log_date", date),
      supabase.from("workout_logs").select("calories").eq("user_id", userId).eq("log_date", date),
    ]);
    if (foods.error || workouts.error) return null;
    const sum = (rows: { calories: number }[] | null) => (rows ?? []).reduce((s, r) => s + Number(r.calories), 0);
    const eaten = Math.round(sum(foods.data));
    const burned = Math.round(sum(workouts.data));
    const allowance = target + burned;
    const before = eaten - addedCalories;

    if (eaten > allowance && before <= allowance) {
      return {
        url: lark.webhook_url,
        text: `[Glow up] Cảnh báo calo: hôm nay bạn đã ăn ${eaten} kcal, vượt mức cho phép ${allowance} kcal (mục tiêu ${target}${burned ? ` + ${burned} kcal tập` : ""}). Các bữa còn lại nên nhẹ, nhiều rau, ít dầu mỡ và đường. Uống đủ nước nhé!`,
      };
    }
    if (eaten >= allowance * 0.9 && before < allowance * 0.9) {
      return {
        url: lark.webhook_url,
        text: `[Glow up] Sắp chạm mức calo hôm nay: đã ăn ${eaten}/${allowance} kcal. Bạn cân nhắc phần ăn còn lại nhé.`,
      };
    }
    return null;
  } catch (err) {
    console.error("Không tạo được cảnh báo calo:", err instanceof Error ? err.message : err);
    return null;
  }
}
