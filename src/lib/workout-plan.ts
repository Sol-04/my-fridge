// Tạo lịch tập trong tuần từ MỤC TIÊU + TRÌNH ĐỘ (+ môn yêu thích), và tính calo đốt.
// Dùng được ở cả máy chủ lẫn trình duyệt (hàm thuần, không đọc dữ liệu ngoài).
import { ACTIVITY_BY_KEY, type Activity } from "../../data/activities";

export type WorkoutGoal = "lose_fat" | "build_muscle" | "healthy";
export type WorkoutLevel = "beginner" | "intermediate" | "advanced";

export const WORKOUT_GOALS: { value: WorkoutGoal; label: string; hint: string }[] = [
  { value: "lose_fat", label: "Giảm mỡ", hint: "Vận động nhiều, đốt nhiều calo" },
  { value: "build_muscle", label: "Tăng cơ", hint: "Ưu tiên bài sức mạnh" },
  { value: "healthy", label: "Khoẻ mạnh, dẻo dai", hint: "Trộn đều vận động và giãn cơ" },
];

export const WORKOUT_LEVELS: { value: WorkoutLevel; label: string; hint: string }[] = [
  { value: "beginner", label: "Mới bắt đầu", hint: "3 buổi/tuần, buổi ngắn" },
  { value: "intermediate", label: "Trung bình", hint: "4 buổi/tuần" },
  { value: "advanced", label: "Nâng cao", hint: "5 buổi/tuần, buổi dài hơn" },
];

export const isWorkoutGoal = (v: unknown): v is WorkoutGoal => WORKOUT_GOALS.some((g) => g.value === v);
export const isWorkoutLevel = (v: unknown): v is WorkoutLevel => WORKOUT_LEVELS.some((l) => l.value === v);

// ---------- Buổi bài tập (gồm nhiều bài) ----------
export type CircuitKey = "dot-mo" | "suc-manh-duoi" | "suc-manh-tren" | "toan-than" | "deo-dai";

type CircuitDef = { name: string; met: number; exercises: string[] };
export const CIRCUITS: Record<CircuitKey, CircuitDef> = {
  "dot-mo": { name: "Bài tập đốt mỡ toàn thân", met: 7.0, exercises: ["bat-nhay", "squat", "leo-nui", "hit-dat", "burpee", "plank"] },
  "suc-manh-duoi": { name: "Sức mạnh thân dưới", met: 5.0, exercises: ["squat", "lunge", "cau-mong", "plank"] },
  "suc-manh-tren": { name: "Sức mạnh thân trên", met: 4.5, exercises: ["hit-dat", "ta-tay", "superman", "gap-bung"] },
  "toan-than": { name: "Sức mạnh toàn thân", met: 5.0, exercises: ["squat", "hit-dat", "lunge", "cau-mong", "plank"] },
  "deo-dai": { name: "Yoga & giãn cơ", met: 2.5, exercises: ["gian-co", "cau-mong", "superman", "plank"] },
};

// Mã lưu trong workout_logs.activity_key: "cau-long" (môn) hoặc "buoi:dot-mo" (buổi bài tập)
export const circuitLogKey = (k: CircuitKey) => `buoi:${k}`;

export type ExerciseDose = { activity: Activity; sets: number; amount: number; unit: "reps" | "seconds" };

const DOSE: Record<WorkoutLevel, { sets: number; reps: number; seconds: number }> = {
  beginner: { sets: 2, reps: 10, seconds: 20 },
  intermediate: { sets: 3, reps: 12, seconds: 40 },
  advanced: { sets: 4, reps: 15, seconds: 60 },
};

export function circuitExercises(key: CircuitKey, level: WorkoutLevel): ExerciseDose[] {
  const d = DOSE[level];
  return CIRCUITS[key].exercises
    .map((k) => ACTIVITY_BY_KEY.get(k))
    .filter((a): a is Activity => Boolean(a))
    .filter((a) => !(level === "beginner" && a.key === "burpee")) // bài nặng — bỏ cho người mới
    .map((a) => {
      const unit = a.unit ?? "reps";
      return { activity: a, sets: d.sets, amount: unit === "seconds" ? d.seconds : d.reps, unit };
    });
}

// ---------- Lịch tuần ----------
export type PlanSession =
  | { type: "sport"; activity: Activity; minutes: number }
  | { type: "circuit"; key: CircuitKey; name: string; minutes: number; exercises: ExerciseDose[] }
  | { type: "rest" };

type Slot = "sport" | "cardio" | "light" | CircuitKey;

const TRAINING_DAYS: Record<WorkoutLevel, number[]> = {
  beginner: [0, 2, 4], // Thứ 2, 4, 6
  intermediate: [0, 1, 3, 5], // Thứ 2, 3, 5, 7
  advanced: [0, 1, 2, 4, 5], // Thứ 2, 3, 4, 6, 7
};

const SLOTS: Record<WorkoutGoal, Slot[]> = {
  lose_fat: ["sport", "dot-mo", "sport", "cardio", "sport"],
  build_muscle: ["suc-manh-duoi", "light", "suc-manh-tren", "toan-than", "light"],
  healthy: ["sport", "deo-dai", "cardio", "sport", "deo-dai"],
};

const SPORT_POOL: Record<WorkoutGoal, string[]> = {
  lose_fat: ["cau-long", "pickleball", "bong-da", "boi", "tennis", "bong-ro"],
  build_muscle: ["boi", "dap-xe", "bong-ban", "pickleball"],
  healthy: ["cau-long", "pickleball", "boi", "bong-ban", "bong-chuyen", "dap-xe"],
};
const CARDIO_POOL: Record<WorkoutLevel, string[]> = {
  beginner: ["di-bo-nhanh", "dap-xe", "aerobic"],
  intermediate: ["chay-bo", "dap-xe", "aerobic", "nhay-day"],
  advanced: ["chay-bo", "nhay-day", "dap-xe", "aerobic"],
};
const LIGHT_POOL = ["di-bo-nhanh", "boi", "yoga", "dap-xe"];

const MINUTES: Record<WorkoutLevel, { sport: number; circuit: number }> = {
  beginner: { sport: 30, circuit: 20 },
  intermediate: { sport: 45, circuit: 30 },
  advanced: { sport: 60, circuit: 45 },
};

// Chọn hoạt động từ danh sách: ưu tiên môn người dùng thích (nếu có trong danh sách phù hợp).
// `shift` đổi gợi ý ("Gợi ý khác") cho đúng một buổi.
function pick(pool: string[], favorites: string[], index: number, shift: number): Activity {
  const favs = favorites.filter((f) => ACTIVITY_BY_KEY.get(f)?.kind === "sport");
  const order = [...favs.filter((f) => pool.includes(f)), ...favs.filter((f) => !pool.includes(f)), ...pool.filter((p) => !favs.includes(p))];
  const list = (favs.length ? order : pool).filter((k, i, a) => a.indexOf(k) === i);
  return ACTIVITY_BY_KEY.get(list[(index + shift) % list.length])!;
}

// Lịch 7 ngày (Thứ 2 → Chủ nhật). `shifts[dayIndex]` = số lần bấm "Gợi ý khác" ở ngày đó.
export function buildWeekPlan(
  goal: WorkoutGoal,
  level: WorkoutLevel,
  favorites: string[] = [],
  shifts: Record<number, number> = {},
): PlanSession[] {
  const days: PlanSession[] = Array.from({ length: 7 }, () => ({ type: "rest" }) as PlanSession);
  const slots = SLOTS[goal];
  const min = MINUTES[level];
  let sportIdx = 0;
  TRAINING_DAYS[level].forEach((day, i) => {
    const slot = slots[i % slots.length];
    const shift = shifts[day] ?? 0;
    if (slot === "sport" || slot === "cardio" || slot === "light") {
      const pool = slot === "sport" ? SPORT_POOL[goal] : slot === "cardio" ? CARDIO_POOL[level] : LIGHT_POOL;
      const activity = pick(pool, slot === "sport" ? favorites : [], slot === "sport" ? sportIdx++ : i, shift);
      days[day] = { type: "sport", activity, minutes: slot === "light" ? min.circuit : min.sport };
    } else {
      // Buổi bài tập: "Gợi ý khác" đổi sang một môn thể thao vừa sức thay thế
      if (shift % 2 === 1) {
        const activity = pick(goal === "build_muscle" ? LIGHT_POOL : SPORT_POOL[goal], favorites, i, Math.floor(shift / 2));
        days[day] = { type: "sport", activity, minutes: min.sport };
      } else {
        days[day] = { type: "circuit", key: slot, name: CIRCUITS[slot].name, minutes: min.circuit, exercises: circuitExercises(slot, level) };
      }
    }
  });
  return days;
}

// Thứ trong tuần theo kiểu Việt Nam: 0 = Thứ 2 … 6 = Chủ nhật (từ chuỗi YYYY-MM-DD)
export function weekdayIndex(isoDate: string): number {
  const [y, m, d] = isoDate.split("-").map(Number);
  const js = new Date(Date.UTC(y, m - 1, d)).getUTCDay(); // 0 = CN
  return (js + 6) % 7;
}
export const WEEKDAY_LABELS = ["Thứ 2", "Thứ 3", "Thứ 4", "Thứ 5", "Thứ 6", "Thứ 7", "Chủ nhật"];

// ---------- Calo đốt ----------
export const DEFAULT_WEIGHT_KG = 60;
export const CUSTOM_ACTIVITY_MET = 4.0; // hoạt động tự nhập: coi như vận động vừa

export function burnedCalories(met: number, weightKg: number, minutes: number): number {
  return Math.round((met * weightKg * minutes) / 60);
}

// MET theo mã đã lưu (môn / buổi bài tập); không biết → null
export function metForKey(key: string | null | undefined): number | null {
  if (!key) return null;
  if (key.startsWith("buoi:")) {
    const c = CIRCUITS[key.slice(5) as CircuitKey];
    return c ? c.met : null;
  }
  return ACTIVITY_BY_KEY.get(key)?.met ?? null;
}

export function nameForKey(key: string): string | null {
  if (key.startsWith("buoi:")) return CIRCUITS[key.slice(5) as CircuitKey]?.name ?? null;
  return ACTIVITY_BY_KEY.get(key)?.name ?? null;
}
