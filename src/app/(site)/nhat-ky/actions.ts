"use server";

// Ghi / sửa / xoá nhật ký ăn uống + tập luyện. Mọi số calo đều TÍNH LẠI trên máy chủ
// (món có sẵn: từ dữ liệu Sanity; hoạt động trong thư viện: từ MET), không tin số từ trình duyệt.
import { revalidatePath } from "next/cache";
import { after } from "next/server";

import { ACTIVITY_BY_KEY } from "../../../../data/activities";
import { isDiaryMeal, isDiaryServings, isValidIsoDate, plainText, type DiaryMeal } from "@/lib/diary";
import { buildCalorieAlert } from "@/lib/lark-alerts";
import { sendLarkText } from "@/lib/lark";
import { getProfile } from "@/lib/profile";
import { createSupabaseServer } from "@/lib/supabase/server";
import {
  burnedCalories,
  CUSTOM_ACTIVITY_MET,
  DEFAULT_WEIGHT_KG,
  isWorkoutGoal,
  isWorkoutLevel,
  metForKey,
  nameForKey,
} from "@/lib/workout-plan";
import { getPlannerRecipes } from "@/sanity/lib/recipes";

export type DiaryResult = { ok: true } | { ok: false; error: string; needLogin?: boolean };

const NOT_READY = "Hệ thống lưu trữ đang tạm thời chưa sẵn sàng. Bạn đợi một chút rồi thử lại nhé.";
const SAVE_FAILED = "Chưa lưu được. Có thể mạng đang chậm, bạn thử lại sau ít phút nhé.";
const r1 = (n: number) => Math.round(n * 10) / 10;

type Session =
  | { ok: true; supabase: NonNullable<Awaited<ReturnType<typeof createSupabaseServer>>>; userId: string }
  | { ok: false; result: DiaryResult };

async function session(): Promise<Session> {
  const supabase = await createSupabaseServer();
  if (!supabase) return { ok: false, result: { ok: false, error: NOT_READY } };
  try {
    const user = (await supabase.auth.getUser()).data.user;
    if (!user) return { ok: false, result: { ok: false, error: "Bạn cần đăng nhập để ghi nhật ký.", needLogin: true } };
    return { ok: true, supabase, userId: user.id };
  } catch {
    return { ok: false, result: { ok: false, error: NOT_READY } };
  }
}

function done(): DiaryResult {
  revalidatePath("/nhat-ky");
  return { ok: true };
}

// ---------- Ăn uống ----------
export type AddFoodInput =
  | { date: string; meal: DiaryMeal; recipeSlug: string; servings: number }
  | { date: string; meal: DiaryMeal; customFoodId: string; servings: number }
  | {
      date: string;
      meal: DiaryMeal;
      name: string;
      calories: number;
      protein?: number | null;
      carbs?: number | null;
      fat?: number | null;
      saveToLibrary?: boolean; // lưu vào "Món của tôi" để dùng lại
    };

const MAX_CUSTOM_FOODS = 100;

export async function addFoodLog(input: AddFoodInput): Promise<DiaryResult> {
  if (!isValidIsoDate(input?.date) || !isDiaryMeal(input?.meal)) return { ok: false, error: "Ngày hoặc bữa chưa hợp lệ." };
  const s = await session();
  if (!s.ok) return s.result;

  let row: Record<string, unknown>;
  let toSave: { name: string; calories: number; protein: number | null; carbs: number | null; fat: number | null } | null = null;
  if ("recipeSlug" in input) {
    if (!isDiaryServings(input.servings)) return { ok: false, error: "Số phần chưa hợp lệ (0,5 đến 3 phần)." };
    const recipe = (await getPlannerRecipes()).find((r) => r.slug === input.recipeSlug);
    if (!recipe) return { ok: false, error: "Không tìm thấy món này. Bạn tải lại trang rồi thử lại nhé." };
    const sv = input.servings;
    row = {
      recipe_slug: recipe.slug,
      name: recipe.name.slice(0, 120),
      servings: sv,
      calories: Math.round(recipe.calories * sv),
      protein: r1(recipe.protein * sv),
      carbs: r1(recipe.carbs * sv),
      fat: r1(recipe.fat * sv),
    };
  } else if ("customFoodId" in input) {
    if (typeof input.customFoodId !== "string" || input.customFoodId.length > 64 || !isDiaryServings(input.servings)) {
      return { ok: false, error: "Món hoặc số phần chưa hợp lệ." };
    }
    // Calo luôn tính lại từ món đã lưu (RLS: chỉ đọc được món của chính mình), không tin số từ trình duyệt
    const { data: food } = await s.supabase.from("custom_foods").select("name, calories, protein, carbs, fat").eq("id", input.customFoodId).eq("user_id", s.userId).maybeSingle();
    if (!food) return { ok: false, error: "Không tìm thấy món này. Bạn tải lại trang rồi thử lại nhé." };
    const sv = input.servings;
    const scale = (v: unknown) => (v == null ? null : r1(Number(v) * sv));
    row = { recipe_slug: null, name: String(food.name).slice(0, 120), servings: sv, calories: Math.round(Number(food.calories) * sv), protein: scale(food.protein), carbs: scale(food.carbs), fat: scale(food.fat) };
  } else {
    const name = String(input.name ?? "").trim().slice(0, 120);
    const calories = Math.round(Number(input.calories));
    if (!name) return { ok: false, error: "Vui lòng nhập tên món." };
    if (!Number.isFinite(calories) || calories < 0 || calories > 5000) return { ok: false, error: "Calo cần là số từ 0 đến 5000." };
    const macro = (v: unknown, max: number) => {
      if (v == null || v === "") return null;
      const n = Number(v);
      return Number.isFinite(n) && n >= 0 && n <= max ? r1(n) : undefined;
    };
    const protein = macro(input.protein, 500);
    const carbs = macro(input.carbs, 1000);
    const fat = macro(input.fat, 500);
    if (protein === undefined || carbs === undefined || fat === undefined) return { ok: false, error: "Đạm / tinh bột / béo cần là số hợp lệ (hoặc để trống)." };
    row = { recipe_slug: null, name, servings: 1, calories, protein, carbs, fat };
    if (input.saveToLibrary === true) toSave = { name, calories, protein, carbs, fat };
  }

  const { error } = await s.supabase.from("food_logs").insert({ ...row, user_id: s.userId, log_date: input.date, meal: input.meal });
  if (error) {
    console.error("Ghi nhật ký ăn lỗi:", error.message);
    return { ok: false, error: SAVE_FAILED };
  }
  // Lưu vào "Món của tôi" (không bắt buộc: lỗi ở đây không làm hỏng việc ghi nhật ký)
  if (toSave) await saveCustomFood(s.supabase, s.userId, toSave);
  // Quá calo → báo qua Lark (nếu người dùng đã bật). Cả việc tính lẫn việc gửi chạy SAU khi trả lời, không làm chậm nút lưu.
  const calories = Number(row.calories);
  const { supabase, userId } = s;
  after(async () => {
    const alert = await buildCalorieAlert(supabase, userId, input.date, calories);
    if (!alert) return;
    const sent = await sendLarkText(alert.url, alert.text);
    if (!sent.ok) console.error("Gửi cảnh báo calo tới Lark lỗi:", sent.error);
  });
  return done();
}

// Thêm / cập nhật 1 món trong "Món của tôi": trùng tên (không phân biệt hoa thường, dấu) thì cập nhật calo thay vì tạo thêm
async function saveCustomFood(
  supabase: Extract<Session, { ok: true }>["supabase"],
  userId: string,
  food: { name: string; calories: number; protein: number | null; carbs: number | null; fat: number | null },
) {
  try {
    const { data: existing, error: readError } = await supabase.from("custom_foods").select("id, name").eq("user_id", userId);
    if (readError) return console.error("Đọc Món của tôi lỗi:", readError.message);
    const key = plainText(food.name);
    const same = (existing ?? []).find((f: { id: string; name: string }) => plainText(f.name) === key);
    if (same) {
      const { error } = await supabase.from("custom_foods").update({ calories: food.calories, protein: food.protein, carbs: food.carbs, fat: food.fat }).eq("id", same.id).eq("user_id", userId);
      if (error) console.error("Sửa Món của tôi lỗi:", error.message);
    } else if ((existing ?? []).length < MAX_CUSTOM_FOODS) {
      const { error } = await supabase.from("custom_foods").insert({ ...food, user_id: userId });
      if (error) console.error("Lưu Món của tôi lỗi:", error.message);
    }
  } catch (err) {
    console.error("Lưu Món của tôi lỗi:", err instanceof Error ? err.message : err);
  }
}

export async function deleteCustomFood(id: string): Promise<DiaryResult> {
  if (typeof id !== "string" || id.length > 64) return { ok: false, error: "Không tìm thấy món cần xoá." };
  const s = await session();
  if (!s.ok) return s.result;
  const { error } = await s.supabase.from("custom_foods").delete().eq("id", id).eq("user_id", s.userId);
  if (error) {
    console.error("Xoá Món của tôi lỗi:", error.message);
    return { ok: false, error: "Chưa xoá được. Bạn thử lại sau ít phút nhé." };
  }
  return done(); // Các bữa đã ghi trước đó giữ nguyên (nhật ký lưu sẵn tên + calo)
}

// Đổi số phần của món có sẵn (món tự nhập thì xoá và ghi lại)
export async function updateFoodServings(id: string, servings: number): Promise<DiaryResult> {
  if (typeof id !== "string" || id.length > 64 || !isDiaryServings(servings)) return { ok: false, error: "Số phần chưa hợp lệ." };
  const s = await session();
  if (!s.ok) return s.result;
  const { data: current } = await s.supabase.from("food_logs").select("recipe_slug").eq("id", id).maybeSingle();
  if (!current) return { ok: false, error: "Không tìm thấy món này. Bạn tải lại trang nhé." };
  if (!current.recipe_slug) return { ok: false, error: "Món tự nhập không đổi được số phần — bạn xoá và ghi lại nhé." };
  const recipe = (await getPlannerRecipes()).find((r) => r.slug === current.recipe_slug);
  if (!recipe) return { ok: false, error: "Món này không còn trên web nữa, bạn xoá và ghi món khác nhé." };
  const { error } = await s.supabase
    .from("food_logs")
    .update({
      servings,
      calories: Math.round(recipe.calories * servings),
      protein: r1(recipe.protein * servings),
      carbs: r1(recipe.carbs * servings),
      fat: r1(recipe.fat * servings),
    })
    .eq("id", id);
  if (error) {
    console.error("Sửa nhật ký ăn lỗi:", error.message);
    return { ok: false, error: SAVE_FAILED };
  }
  return done();
}

export async function deleteFoodLog(id: string): Promise<DiaryResult> {
  if (typeof id !== "string" || id.length > 64) return { ok: false, error: "Không tìm thấy món cần xoá." };
  const s = await session();
  if (!s.ok) return s.result;
  const { error } = await s.supabase.from("food_logs").delete().eq("id", id);
  if (error) {
    console.error("Xoá nhật ký ăn lỗi:", error.message);
    return { ok: false, error: "Chưa xoá được. Bạn thử lại sau ít phút nhé." };
  }
  return done();
}

// Chép thực đơn gợi ý (trang tạo thực đơn, bước 3) vào nhật ký 1 ngày
export async function logPlannerMeals(
  date: string,
  meals: { meal: DiaryMeal; recipeId: string; servings: number }[],
): Promise<DiaryResult> {
  if (
    !isValidIsoDate(date) ||
    !Array.isArray(meals) ||
    meals.length === 0 ||
    meals.length > 4 ||
    new Set(meals.map((m) => m?.meal)).size !== meals.length // mỗi bữa 1 món
  ) {
    return { ok: false, error: "Thực đơn chưa hợp lệ." };
  }
  const byId = new Map((await getPlannerRecipes()).map((r) => [r._id, r]));
  const rows = [];
  for (const m of meals) {
    const recipe = byId.get(m?.recipeId);
    const sv = Number(m?.servings);
    if (!recipe || !isDiaryMeal(m.meal) || !Number.isInteger(sv * 4) || sv < 0.5 || sv > 2.5) return { ok: false, error: "Thực đơn chưa hợp lệ." };
    rows.push({
      log_date: date,
      meal: m.meal,
      recipe_slug: recipe.slug,
      name: recipe.name.slice(0, 120),
      servings: sv,
      calories: Math.round(recipe.calories * sv),
      protein: r1(recipe.protein * sv),
      carbs: r1(recipe.carbs * sv),
      fat: r1(recipe.fat * sv),
    });
  }
  const s = await session();
  if (!s.ok) return s.result;
  const { error } = await s.supabase.from("food_logs").insert(rows.map((r) => ({ ...r, user_id: s.userId })));
  if (error) {
    console.error("Chép thực đơn vào nhật ký lỗi:", error.message);
    return { ok: false, error: SAVE_FAILED };
  }
  return done();
}

// ---------- Tập luyện ----------
export async function saveWorkoutPlan(input: { goal: string; level: string; favorites: string[] }): Promise<DiaryResult> {
  if (!isWorkoutGoal(input?.goal) || !isWorkoutLevel(input?.level)) return { ok: false, error: "Vui lòng chọn mục tiêu và trình độ." };
  const favorites = Array.isArray(input.favorites)
    ? [...new Set(input.favorites.filter((k) => typeof k === "string" && ACTIVITY_BY_KEY.get(k)?.kind === "sport"))].slice(0, 20)
    : [];
  const s = await session();
  if (!s.ok) return s.result;
  const { error } = await s.supabase.from("workout_plans").upsert({
    user_id: s.userId,
    goal: input.goal,
    level: input.level,
    favorite_activities: favorites,
    updated_at: new Date().toISOString(),
  });
  if (error) {
    console.error("Lưu kế hoạch tập lỗi:", error.message);
    return { ok: false, error: SAVE_FAILED };
  }
  return done();
}

export type AddWorkoutInput =
  | { date: string; activityKey: string; minutes: number }
  | { date: string; name: string; minutes: number; calories?: number | null };

export async function addWorkoutLog(input: AddWorkoutInput): Promise<DiaryResult> {
  const minutes = Math.round(Number(input?.minutes));
  if (!isValidIsoDate(input?.date)) return { ok: false, error: "Ngày chưa hợp lệ." };
  if (!Number.isFinite(minutes) || minutes < 1 || minutes > 600) return { ok: false, error: "Số phút cần từ 1 đến 600." };

  const s = await session();
  if (!s.ok) return s.result;
  const weight = (await getProfile(s.supabase, s.userId))?.weight_kg ?? DEFAULT_WEIGHT_KG;

  let key: string | null = null;
  let name: string;
  let calories: number;
  if ("activityKey" in input) {
    const met = metForKey(input.activityKey);
    const known = nameForKey(input.activityKey);
    if (met == null || !known) return { ok: false, error: "Không tìm thấy hoạt động này." };
    key = input.activityKey;
    name = known;
    calories = burnedCalories(met, weight, minutes);
  } else {
    name = String(input.name ?? "").trim().slice(0, 120);
    if (!name) return { ok: false, error: "Vui lòng nhập tên hoạt động." };
    const given = input.calories == null || (input.calories as unknown) === "" ? null : Math.round(Number(input.calories));
    if (given != null && (!Number.isFinite(given) || given < 0 || given > 5000)) return { ok: false, error: "Calo cần là số từ 0 đến 5000 (hoặc để trống)." };
    calories = given ?? burnedCalories(CUSTOM_ACTIVITY_MET, weight, minutes);
  }
  calories = Math.min(calories, 5000);

  const { error } = await s.supabase
    .from("workout_logs")
    .insert({ user_id: s.userId, log_date: input.date, activity_key: key, name, minutes, calories });
  if (error) {
    console.error("Ghi nhật ký tập lỗi:", error.message);
    return { ok: false, error: SAVE_FAILED };
  }
  return done();
}

export async function deleteWorkoutLog(id: string): Promise<DiaryResult> {
  if (typeof id !== "string" || id.length > 64) return { ok: false, error: "Không tìm thấy hoạt động cần xoá." };
  const s = await session();
  if (!s.ok) return s.result;
  const { error } = await s.supabase.from("workout_logs").delete().eq("id", id);
  if (error) {
    console.error("Xoá nhật ký tập lỗi:", error.message);
    return { ok: false, error: "Chưa xoá được. Bạn thử lại sau ít phút nhé." };
  }
  return done();
}
