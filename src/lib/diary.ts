// Nhật ký ăn uống + tập luyện: kiểu dữ liệu và hàm ngày tháng dùng chung (máy chủ + trình duyệt).

export type DiaryMeal = "breakfast" | "lunch" | "dinner" | "snack";

export const DIARY_MEALS: { value: DiaryMeal; label: string }[] = [
  { value: "breakfast", label: "Bữa sáng" },
  { value: "lunch", label: "Bữa trưa" },
  { value: "dinner", label: "Bữa tối" },
  { value: "snack", label: "Bữa phụ" },
];
export const isDiaryMeal = (v: unknown): v is DiaryMeal => DIARY_MEALS.some((m) => m.value === v);

// Số phần cho món có sẵn: 0,5 → 3 (bước 0,5)
export const DIARY_SERVINGS = [0.5, 1, 1.5, 2, 2.5, 3];
export const isDiaryServings = (v: unknown): v is number => typeof v === "number" && DIARY_SERVINGS.includes(v);

export type FoodLog = {
  id: string;
  log_date: string;
  meal: DiaryMeal;
  recipe_slug: string | null;
  name: string;
  servings: number;
  calories: number;
  protein: number | null;
  carbs: number | null;
  fat: number | null;
};

export type WorkoutLog = {
  id: string;
  log_date: string;
  activity_key: string | null;
  name: string;
  minutes: number;
  calories: number;
};

export type WorkoutPlanRow = {
  goal: "lose_fat" | "build_muscle" | "healthy";
  level: "beginner" | "intermediate" | "advanced";
  favorite_activities: string[];
};

// ---------- Ngày tháng (theo giờ Việt Nam) ----------
const ISO = /^\d{4}-\d{2}-\d{2}$/;

export function todayInVietnam(now: Date = new Date()): string {
  // en-CA cho ra dạng YYYY-MM-DD
  return new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Ho_Chi_Minh" }).format(now);
}

export function isValidIsoDate(v: unknown): v is string {
  if (typeof v !== "string" || !ISO.test(v)) return false;
  const [y, m, d] = v.split("-").map(Number);
  const dt = new Date(Date.UTC(y, m - 1, d));
  return dt.getUTCFullYear() === y && dt.getUTCMonth() === m - 1 && dt.getUTCDate() === d && y >= 2020 && y < 2100;
}

export function addDays(iso: string, n: number): string {
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(Date.UTC(y, m - 1, d + n)).toISOString().slice(0, 10);
}

// "Thứ 5, 06/11/2026"
export function formatDiaryDate(iso: string): string {
  const [y, m, d] = iso.split("-").map(Number);
  const wd = (new Date(Date.UTC(y, m - 1, d)).getUTCDay() + 6) % 7;
  const names = ["Thứ 2", "Thứ 3", "Thứ 4", "Thứ 5", "Thứ 6", "Thứ 7", "Chủ nhật"];
  return `${names[wd]}, ${String(d).padStart(2, "0")}/${String(m).padStart(2, "0")}/${y}`;
}

// Bỏ dấu tiếng Việt để tìm món
export function plainText(s: string): string {
  return s.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/đ/g, "d");
}
