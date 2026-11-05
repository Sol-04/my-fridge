"use server";

// Lưu thực đơn vào Supabase rồi chuyển tới trang /thuc-don/[id].
import { redirect } from "next/navigation";

import {
  buildMealEntry,
  calcTargetCalories,
  EATOUT_SERVINGS,
  MEAL_ORDER,
  parseUserInput,
  SERVINGS_MAX,
  SERVINGS_MIN,
  type MealEntry,
} from "@/lib/meal-plan";
import { createSupabaseServer } from "@/lib/supabase/server";
import { getPlannerRecipes, type Meal } from "@/sanity/lib/recipes";

export type SaveMealPlanInput = {
  userInput: unknown;
  selectedFoods: unknown;
  // Mỗi bữa: id món + số khẩu phần (hoặc null nếu không có món)
  meals: Partial<Record<Meal, { recipeId: string; servings: number; kind?: "home" | "eatout" } | null>>;
};

export type SaveMealPlanResult = { error: string; needLogin?: boolean };

export async function saveMealPlan(input: SaveMealPlanInput): Promise<SaveMealPlanResult> {
  // 1) Kiểm tra lại dữ liệu trên máy chủ (không tin hoàn toàn dữ liệu từ trình duyệt)
  const userInput = parseUserInput(input?.userInput);
  if (!userInput) return { error: "Thông tin cá nhân chưa hợp lệ. Vui lòng kiểm tra lại bước 1." };

  const selectedFoods = Array.isArray(input.selectedFoods)
    ? [...new Set(input.selectedFoods.filter((f): f is string => typeof f === "string" && f.length <= 60))].slice(0, 100)
    : [];

  // 2) Tính lại calo & dinh dưỡng từ dữ liệu món trên Sanity
  const recipes = await getPlannerRecipes();
  const byId = new Map(recipes.map((r) => [r._id, r]));
  const entries: Record<Meal, MealEntry | null> = { breakfast: null, lunch: null, dinner: null };
  for (const meal of MEAL_ORDER) {
    const choice = input.meals?.[meal];
    if (!choice) continue;
    const recipe = byId.get(choice.recipeId);
    const servings = Number(choice.servings);
    if (!recipe || !recipe.meals?.includes(meal)) {
      return { error: "Có món không còn tồn tại. Vui lòng tải lại trang và thử lại." };
    }
    const kind = recipe.kind === "eatout" ? "eatout" : "home";
    if ((choice.kind ?? "home") !== kind) {
      return { error: "Thông tin món chưa khớp. Vui lòng tải lại trang và thử lại." };
    }
    // Món ăn ngoài luôn 1 phần; món tự nấu từ 0,5 đến 2,5 phần
    const validServings =
      kind === "eatout"
        ? servings === EATOUT_SERVINGS
        : Number.isFinite(servings) && servings >= SERVINGS_MIN && servings <= SERVINGS_MAX;
    if (!validServings) {
      return { error: "Khẩu phần không hợp lệ." };
    }
    entries[meal] = buildMealEntry(recipe, servings);
  }
  if (!entries.breakfast && !entries.lunch && !entries.dinner) {
    return { error: "Thực đơn chưa có món nào để lưu." };
  }

  // 3) Phải đăng nhập mới lưu được
  const supabase = await createSupabaseServer();
  if (!supabase) return { error: "Hệ thống lưu trữ đang tạm thời chưa sẵn sàng. Thực đơn vẫn còn nguyên trên màn hình, bạn đợi một chút rồi bấm “Lưu thực đơn” lần nữa nhé." };

  let userId: string | null = null;
  try {
    userId = (await supabase.auth.getUser()).data.user?.id ?? null;
  } catch {
    userId = null;
  }
  if (!userId) {
    return { error: "Bạn cần đăng nhập để lưu thực đơn. Thực đơn đang làm sẽ được giữ lại.", needLogin: true };
  }

  // 4) Lưu vào Supabase. Tạo sẵn id để không cần đọc lại bảng sau khi lưu.
  const id = crypto.randomUUID();
  let errorMessage: string | null = null;
  try {
    const { error } = await supabase.from("meal_plans").insert({
      id,
      user_id: userId,
      user_input: userInput,
      target_calories: calcTargetCalories(userInput),
      selected_foods: selectedFoods,
      breakfast: entries.breakfast,
      lunch: entries.lunch,
      dinner: entries.dinner,
    });
    if (error) errorMessage = error.message;
  } catch (err) {
    errorMessage = err instanceof Error ? err.message : String(err);
  }

  if (errorMessage) {
    console.error("Lưu thực đơn thất bại:", errorMessage);
    return { error: "Có thể mạng đang chậm hoặc hệ thống đang bận. Thực đơn vẫn còn nguyên trên màn hình, bạn đợi một chút rồi bấm “Lưu thực đơn” lần nữa nhé." };
  }

  // 5) Chuyển tới trang xem thực đơn (redirect phải nằm ngoài try/catch)
  redirect(`/thuc-don/${id}`);
}
