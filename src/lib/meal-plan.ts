// Các hàm tính toán cho trang tạo thực đơn (không phụ thuộc giao diện hay Supabase).
import type { Meal, PlannerRecipe } from "@/sanity/lib/recipes";

// ---------- Thông tin người dùng ----------
export type Gender = "female" | "male";
export type Activity = "sedentary" | "light" | "moderate" | "active";
export type Goal = "lose" | "maintain" | "gain";

export type UserInput = {
  gender: Gender;
  age: number;
  heightCm: number;
  weightKg: number;
  activity: Activity;
  goal: Goal;
};

export const GENDER_OPTIONS: { value: Gender; label: string }[] = [
  { value: "female", label: "Nữ" },
  { value: "male", label: "Nam" },
];

export const ACTIVITY_OPTIONS: { value: Activity; label: string; hint: string; factor: number }[] = [
  { value: "sedentary", label: "Ít vận động", hint: "Ngồi nhiều, hầu như không tập", factor: 1.2 },
  { value: "light", label: "Vận động nhẹ", hint: "Tập 1–3 buổi/tuần", factor: 1.375 },
  { value: "moderate", label: "Vận động vừa", hint: "Tập 3–5 buổi/tuần", factor: 1.55 },
  { value: "active", label: "Vận động nhiều", hint: "Tập 6–7 buổi/tuần", factor: 1.725 },
];

export const GOAL_OPTIONS: { value: Goal; label: string; delta: number }[] = [
  { value: "lose", label: "Giảm cân", delta: -500 },
  { value: "maintain", label: "Giữ cân", delta: 0 },
  { value: "gain", label: "Tăng cân", delta: 300 },
];

export const INPUT_LIMITS = {
  age: { min: 15, max: 100 },
  heightCm: { min: 120, max: 220 },
  weightKg: { min: 30, max: 250 },
} as const;

const inRange = (n: unknown, { min, max }: { min: number; max: number }) =>
  typeof n === "number" && Number.isFinite(n) && n >= min && n <= max;

// Kiểm tra thông tin người dùng (dùng cả ở trình duyệt lẫn máy chủ).
export function parseUserInput(raw: unknown): UserInput | null {
  if (!raw || typeof raw !== "object") return null;
  const r = raw as Record<string, unknown>;
  if (!GENDER_OPTIONS.some((o) => o.value === r.gender)) return null;
  if (!ACTIVITY_OPTIONS.some((o) => o.value === r.activity)) return null;
  if (!GOAL_OPTIONS.some((o) => o.value === r.goal)) return null;
  if (!inRange(r.age, INPUT_LIMITS.age)) return null;
  if (!inRange(r.heightCm, INPUT_LIMITS.heightCm)) return null;
  if (!inRange(r.weightKg, INPUT_LIMITS.weightKg)) return null;
  return {
    gender: r.gender as Gender,
    age: Math.round(r.age as number),
    heightCm: Math.round(r.heightCm as number),
    weightKg: Math.round((r.weightKg as number) * 10) / 10,
    activity: r.activity as Activity,
    goal: r.goal as Goal,
  };
}

// Calo mục tiêu mỗi ngày: BMR (Mifflin-St Jeor) × hệ số vận động ± theo mục tiêu.
export function calcTargetCalories(u: UserInput): number {
  const bmr = 10 * u.weightKg + 6.25 * u.heightCm - 5 * u.age + (u.gender === "male" ? 5 : -161);
  const factor = ACTIVITY_OPTIONS.find((o) => o.value === u.activity)!.factor;
  const delta = GOAL_OPTIONS.find((o) => o.value === u.goal)!.delta;
  const floor = u.gender === "male" ? 1500 : 1200; // không ăn dưới mức an toàn
  return Math.round(Math.max(bmr * factor + delta, floor) / 10) * 10;
}

export function describeUser(u: UserInput): string {
  return [
    GENDER_OPTIONS.find((o) => o.value === u.gender)?.label,
    `${u.age} tuổi`,
    `${u.heightCm} cm`,
    `${u.weightKg} kg`,
    ACTIVITY_OPTIONS.find((o) => o.value === u.activity)?.label,
    GOAL_OPTIONS.find((o) => o.value === u.goal)?.label,
  ]
    .filter(Boolean)
    .join(" · ");
}

// ---------- Chia calo cho các bữa ----------
export const MEAL_SPLIT: Record<Meal, number> = { breakfast: 0.25, lunch: 0.4, dinner: 0.35 };
export const MEAL_ORDER: Meal[] = ["breakfast", "lunch", "dinner"];

export function mealTargets(target: number): Record<Meal, number> {
  return {
    breakfast: Math.round(target * MEAL_SPLIT.breakfast),
    lunch: Math.round(target * MEAL_SPLIT.lunch),
    dinner: Math.round(target * MEAL_SPLIT.dinner),
  };
}

// ---------- Nguyên liệu ----------
// Gia vị coi như nhà nào cũng có, không bắt người dùng chọn.
export const PANTRY_STAPLES = new Set([
  "Dầu ăn",
  "Nước mắm",
  "Hành lá",
  "Hành tím",
  "Tỏi",
  "Gừng",
  "Nước cốt chanh",
  "Mè",
]);

const GROUPS: { title: string; items: string[] }[] = [
  {
    title: "Đạm (thịt, cá, trứng, đậu)",
    items: [
      "Trứng gà", "Ức gà", "Thịt heo nạc", "Thịt bò nạc", "Thịt bò bắp", "Cá basa", "Cá rô phi", "Cá thu",
      "Tôm", "Mực", "Nghêu", "Đậu phụ",
    ],
  },
  {
    title: "Tinh bột",
    items: [
      "Cơm gạo lứt", "Yến mạch", "Khoai lang", "Khoai tây", "Ngô ngọt", "Bún tươi", "Bánh phở tươi",
      "Miến dong", "Bánh tráng", "Bánh mì nguyên cám",
    ],
  },
  {
    title: "Rau củ, nấm",
    items: [
      "Cải ngọt", "Cải thìa", "Rau muống", "Mồng tơi", "Xà lách", "Bông cải xanh", "Cà chua",
      "Dưa leo", "Cà rốt", "Bí đỏ", "Đậu bắp", "Nấm rơm", "Giá đỗ", "Bắp cải", "Su su", "Bí xanh",
      "Mướp", "Đậu que", "Rau dền", "Rau ngót", "Cải bó xôi", "Nấm kim châm", "Hành tây", "Ớt chuông",
    ],
  },
  {
    title: "Sữa, trái cây, hạt",
    items: [
      "Sữa tươi không đường", "Sữa đậu nành không đường", "Sữa chua không đường", "Chuối", "Táo",
      "Thanh long", "Đu đủ", "Đậu phộng",
    ],
  },
];

// Nhóm các nguyên liệu (lấy từ món ăn trên Sanity) để hiện ở bước 2.
// Nguyên liệu mới chưa có trong nhóm nào sẽ vào nhóm "Khác".
export function groupIngredients(recipes: PlannerRecipe[]): { title: string; items: string[] }[] {
  const all = new Set<string>();
  for (const r of recipes) for (const ing of r.ingredients ?? []) {
    if (!PANTRY_STAPLES.has(ing.name)) all.add(ing.name);
  }
  const used = new Set<string>();
  const groups = GROUPS.map((g) => {
    const items = g.items.filter((i) => all.has(i));
    items.forEach((i) => used.add(i));
    return { title: g.title, items };
  });
  const others = [...all].filter((i) => !used.has(i)).sort((a, b) => a.localeCompare(b, "vi"));
  return [...groups, { title: "Khác", items: others }].filter((g) => g.items.length > 0);
}

// ---------- Gợi ý món ----------
export type RankedRecipe = {
  recipe: PlannerRecipe;
  missing: string[]; // nguyên liệu chính còn thiếu
  coverage: number; // tỉ lệ nguyên liệu chính đang có (0–1)
};

export function rankRecipes(
  recipes: PlannerRecipe[],
  meal: Meal,
  selected: Set<string>,
  mealTarget: number,
): RankedRecipe[] {
  return recipes
    // Chỉ món TỰ NẤU (món ăn ngoài không có nguyên liệu → sẽ bị coi là "đủ 100%" nếu không loại ra)
    .filter((r) => r.kind !== "eatout" && r.meals?.includes(meal))
    .map((recipe) => {
      const main = (recipe.ingredients ?? []).filter((i) => !PANTRY_STAPLES.has(i.name));
      const missing = main.filter((i) => !selected.has(i.name)).map((i) => i.name);
      const coverage = main.length === 0 ? 1 : (main.length - missing.length) / main.length;
      return { recipe, missing, coverage };
    })
    .filter((r) => r.coverage > 0)
    .sort((a, b) => {
      if (b.coverage !== a.coverage) return b.coverage - a.coverage;
      const da = Math.abs(a.recipe.calories - mealTarget);
      const db = Math.abs(b.recipe.calories - mealTarget);
      return da - db;
    });
}

// Món ăn ngoài / mua sẵn của 1 bữa: món có calo gần mục tiêu nhất xếp trước.
export function rankEatOut(recipes: PlannerRecipe[], meal: Meal, mealTarget: number): PlannerRecipe[] {
  return recipes
    .filter((r) => r.kind === "eatout" && r.meals?.includes(meal))
    .sort((a, b) => Math.abs(a.calories - mealTarget) - Math.abs(b.calories - mealTarget));
}

// Chia calo cho các bữa khi có bữa ăn ngoài (calo cố định 1 phần):
// phần calo còn lại của ngày chia cho các bữa tự nấu theo tỉ lệ 25/40/35,
// để tổng ngày vẫn sát mục tiêu. `fixed` = calo cố định của các bữa ăn ngoài.
export function rebalanceTargets(target: number, fixed: Partial<Record<Meal, number>>): Record<Meal, number> {
  const base = mealTargets(target);
  const fixedMeals = MEAL_ORDER.filter((m) => fixed[m] != null);
  if (fixedMeals.length === 0) return base;
  const fixedTotal = fixedMeals.reduce((sum, m) => sum + (fixed[m] ?? 0), 0);
  const free = MEAL_ORDER.filter((m) => fixed[m] == null);
  const shareTotal = free.reduce((sum, m) => sum + MEAL_SPLIT[m], 0);
  // Không để bữa tự nấu xuống quá thấp (tối thiểu 60% mức bình thường)
  const remaining = Math.max(target - fixedTotal, 0);
  const result = { ...base };
  for (const m of MEAL_ORDER) {
    if (fixed[m] != null) result[m] = fixed[m]!;
    else result[m] = Math.max(Math.round((remaining * MEAL_SPLIT[m]) / shareTotal), Math.round(base[m] * 0.6));
  }
  return result;
}

// Số khẩu phần để vừa calo của bữa: làm tròn 0,25; giới hạn 0,5–2,5.
export const SERVINGS_MIN = 0.5;
export const SERVINGS_MAX = 2.5;

// Món ăn ngoài luôn tính 1 phần (không ai gọi 1,25 tô phở)
export const EATOUT_SERVINGS = 1;

export function portionFor(caloriesPerServing: number, mealTarget: number): number {
  if (!caloriesPerServing || caloriesPerServing <= 0) return 1;
  const raw = mealTarget / caloriesPerServing;
  const rounded = Math.round(raw * 4) / 4;
  return Math.min(SERVINGS_MAX, Math.max(SERVINGS_MIN, rounded));
}

// ---------- Dữ liệu 1 bữa để lưu / hiển thị ----------
export type MealEntry = {
  recipe_id: string;
  slug: string;
  name: string;
  servings: number;
  serving_grams: number;
  calories_per_serving: number;
  total_calories: number;
  protein: number;
  carbs: number;
  fat: number;
  kind?: "home" | "eatout"; // thực đơn lưu trước đây không có trường này → coi là "home"
  serving_note?: string | null;
  healthy_tip?: string | null;
};

const r1 = (n: number) => Math.round(n * 10) / 10;

export function buildMealEntry(recipe: PlannerRecipe, servings: number): MealEntry {
  return {
    recipe_id: recipe._id,
    slug: recipe.slug,
    name: recipe.name,
    servings,
    serving_grams: recipe.servingGrams,
    calories_per_serving: recipe.calories,
    total_calories: Math.round(recipe.calories * servings),
    protein: r1(recipe.protein * servings),
    carbs: r1(recipe.carbs * servings),
    fat: r1(recipe.fat * servings),
    kind: recipe.kind === "eatout" ? "eatout" : "home",
    ...(recipe.kind === "eatout"
      ? { serving_note: recipe.servingNote ?? null, healthy_tip: recipe.healthyTip ?? null }
      : {}),
  };
}

export function sumMeals(entries: (MealEntry | null | undefined)[]) {
  const t = { calories: 0, protein: 0, carbs: 0, fat: 0 };
  for (const e of entries) {
    if (!e) continue;
    t.calories += e.total_calories;
    t.protein += e.protein;
    t.carbs += e.carbs;
    t.fat += e.fat;
  }
  return { calories: Math.round(t.calories), protein: r1(t.protein), carbs: r1(t.carbs), fat: r1(t.fat) };
}

// "1,25" kiểu Việt Nam
export function formatServings(n: number): string {
  return n.toLocaleString("vi-VN", { maximumFractionDigits: 2 });
}
