"use client";

import { useMemo, useState, useTransition } from "react";

import { MealEntryCard } from "@/components/MealEntryCard";
import { NutritionTotals } from "@/components/NutritionTotals";
import {
  ACTIVITY_OPTIONS,
  buildMealEntry,
  calcTargetCalories,
  GENDER_OPTIONS,
  GOAL_OPTIONS,
  groupIngredients,
  INPUT_LIMITS,
  MEAL_ORDER,
  mealTargets,
  parseUserInput,
  portionFor,
  rankRecipes,
  sumMeals,
  type Activity,
  type Gender,
  type Goal,
} from "@/lib/meal-plan";
import type { Meal, PlannerRecipe } from "@/sanity/lib/recipes";
import { mealLabel } from "@/sanity/meals";

import { saveMealPlan } from "./actions";

const STEPS = ["Thông tin", "Thực phẩm", "Thực đơn"];

// Ô chọn dạng nút (giới tính, mục tiêu, thực phẩm...)
function Chip({
  active,
  onClick,
  children,
  className = "",
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={`min-h-11 rounded-xl border px-3 text-sm font-medium transition ${
        active
          ? "border-emerald-600 bg-emerald-600 text-white"
          : "border-zinc-300 bg-white text-zinc-700 hover:border-emerald-600 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-200"
      } ${className}`}
    >
      {children}
    </button>
  );
}

function NumberField({
  label,
  unit,
  value,
  onChange,
  limits,
}: {
  label: string;
  unit: string;
  value: string;
  onChange: (v: string) => void;
  limits: { min: number; max: number };
}) {
  const n = Number(value);
  const invalid = value !== "" && !(n >= limits.min && n <= limits.max);
  return (
    <label className="block">
      <span className="text-sm font-medium text-zinc-700 dark:text-zinc-300">{label}</span>
      <div className="mt-1 flex items-center gap-2">
        <input
          type="number"
          inputMode="decimal"
          min={limits.min}
          max={limits.max}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          aria-invalid={invalid}
          className={`min-h-12 w-full rounded-xl border bg-white px-3 text-base text-zinc-900 outline-none focus:ring-2 focus:ring-emerald-500 dark:bg-zinc-900 dark:text-zinc-100 ${
            invalid ? "border-red-400" : "border-zinc-300 dark:border-zinc-700"
          }`}
        />
        <span className="w-8 shrink-0 text-sm text-zinc-500">{unit}</span>
      </div>
      {invalid && (
        <span className="mt-1 block text-xs text-red-600">
          Nhập từ {limits.min} đến {limits.max} {unit}
        </span>
      )}
    </label>
  );
}

export function Planner({ recipes }: { recipes: PlannerRecipe[] }) {
  const [step, setStep] = useState(0);

  // Bước 1
  const [gender, setGender] = useState<Gender>("female");
  const [age, setAge] = useState("");
  const [height, setHeight] = useState("");
  const [weight, setWeight] = useState("");
  const [activity, setActivity] = useState<Activity>("light");
  const [goal, setGoal] = useState<Goal>("lose");

  const userInput = parseUserInput({
    gender,
    age: Number(age),
    heightCm: Number(height),
    weightKg: Number(weight),
    activity,
    goal,
  });
  const target = userInput ? calcTargetCalories(userInput) : null;

  // Bước 2
  const groups = useMemo(() => groupIngredients(recipes), [recipes]);
  const allFoods = useMemo(() => groups.flatMap((g) => g.items), [groups]);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const toggleFood = (name: string) =>
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(name)) next.delete(name);
      else next.add(name);
      return next;
    });

  // Bước 3
  const targets = target ? mealTargets(target) : null;
  // Danh sách món gợi ý cho từng bữa (chỉ ~24 món nên tính lại mỗi lần vẫn rất nhanh)
  const ranked = targets
    ? (Object.fromEntries(
        MEAL_ORDER.map((m) => [m, rankRecipes(recipes, m, selected, targets[m])]),
      ) as Record<Meal, ReturnType<typeof rankRecipes>>)
    : null;
  const [choiceIndex, setChoiceIndex] = useState<Record<Meal, number>>({ breakfast: 0, lunch: 0, dinner: 0 });

  const plan = MEAL_ORDER.map((meal) => {
    const list = ranked?.[meal] ?? [];
    const pick = list.length > 0 ? list[choiceIndex[meal] % list.length] : null;
    const servings = pick && targets ? portionFor(pick.recipe.calories, targets[meal]) : 1;
    return {
      meal,
      count: list.length,
      pick,
      entry: pick ? buildMealEntry(pick.recipe, servings) : null,
    };
  });
  const totals = sumMeals(plan.map((p) => p.entry));

  // Lưu
  const [saving, startSaving] = useTransition();
  const [saveError, setSaveError] = useState<string | null>(null);
  const onSave = () => {
    if (!userInput) return;
    setSaveError(null);
    startSaving(async () => {
      try {
        const res = await saveMealPlan({
          userInput,
          selectedFoods: [...selected],
          meals: Object.fromEntries(
            plan.map((p) => [p.meal, p.entry ? { recipeId: p.entry.recipe_id, servings: p.entry.servings } : null]),
          ),
        });
        // Nếu lưu thành công, máy chủ tự chuyển trang; chỉ khi lỗi mới có kết quả trả về.
        if (res?.error) setSaveError(res.error);
      } catch (err) {
        // Lệnh chuyển trang của Next.js cũng đi qua đây — không coi là lỗi.
        if (err && typeof err === "object" && "digest" in err && String(err.digest).startsWith("NEXT_REDIRECT")) throw err;
        setSaveError("Không lưu được thực đơn. Vui lòng kiểm tra mạng và thử lại.");
      }
    });
  };

  const canNext = step === 0 ? !!userInput : step === 1 ? selected.size > 0 : false;
  const goTo = (s: number) => {
    setStep(s);
    if (typeof window !== "undefined") window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div>
      {/* Thanh tiến trình */}
      <ol className="flex gap-2" aria-label="Các bước">
        {STEPS.map((label, i) => (
          <li key={label} className="flex-1">
            <div className={`h-1.5 rounded-full ${i <= step ? "bg-emerald-600" : "bg-zinc-200 dark:bg-zinc-800"}`} />
            <p
              className={`mt-1 text-xs ${i === step ? "font-semibold text-emerald-700 dark:text-emerald-400" : "text-zinc-500"}`}
              aria-current={i === step ? "step" : undefined}
            >
              Bước {i + 1}: {label}
            </p>
          </li>
        ))}
      </ol>

      {/* ---------- BƯỚC 1 ---------- */}
      {step === 0 && (
        <div className="mt-6 space-y-6">
          <h2 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">Thông tin của bạn</h2>

          <fieldset>
            <legend className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Giới tính</legend>
            <div className="mt-1 grid grid-cols-2 gap-2">
              {GENDER_OPTIONS.map((o) => (
                <Chip key={o.value} active={gender === o.value} onClick={() => setGender(o.value)}>
                  {o.label}
                </Chip>
              ))}
            </div>
          </fieldset>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <NumberField label="Tuổi" unit="tuổi" value={age} onChange={setAge} limits={INPUT_LIMITS.age} />
            <NumberField label="Chiều cao" unit="cm" value={height} onChange={setHeight} limits={INPUT_LIMITS.heightCm} />
            <NumberField label="Cân nặng" unit="kg" value={weight} onChange={setWeight} limits={INPUT_LIMITS.weightKg} />
          </div>

          <fieldset>
            <legend className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Mức vận động</legend>
            <div className="mt-1 grid grid-cols-1 gap-2 sm:grid-cols-2">
              {ACTIVITY_OPTIONS.map((o) => (
                <Chip
                  key={o.value}
                  active={activity === o.value}
                  onClick={() => setActivity(o.value)}
                  className="py-2 text-left"
                >
                  <span className="block">{o.label}</span>
                  <span className={`block text-xs font-normal ${activity === o.value ? "text-emerald-100" : "text-zinc-500"}`}>
                    {o.hint}
                  </span>
                </Chip>
              ))}
            </div>
          </fieldset>

          <fieldset>
            <legend className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Mục tiêu</legend>
            <div className="mt-1 grid grid-cols-3 gap-2">
              {GOAL_OPTIONS.map((o) => (
                <Chip key={o.value} active={goal === o.value} onClick={() => setGoal(o.value)}>
                  {o.label}
                </Chip>
              ))}
            </div>
          </fieldset>

          <div className="rounded-2xl bg-emerald-50 p-4 dark:bg-emerald-950" aria-live="polite">
            {target ? (
              <>
                <p className="text-sm text-emerald-800 dark:text-emerald-300">Calo mục tiêu mỗi ngày</p>
                <p className="text-3xl font-bold text-zinc-900 dark:text-zinc-100">{target} kcal</p>
              </>
            ) : (
              <p className="text-sm text-zinc-600 dark:text-zinc-400">
                Nhập tuổi, chiều cao, cân nặng để tính calo mục tiêu.
              </p>
            )}
          </div>
        </div>
      )}

      {/* ---------- BƯỚC 2 ---------- */}
      {step === 1 && (
        <div className="mt-6">
          <h2 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">Bạn đang có thực phẩm gì?</h2>
          <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
            Chạm để chọn. Gia vị cơ bản (dầu ăn, nước mắm, hành, tỏi, gừng…) đã được tính sẵn.
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => setSelected(new Set(allFoods))}
              className="min-h-11 rounded-full px-3 text-sm font-medium text-emerald-700 underline-offset-2 hover:underline"
            >
              Chọn tất cả
            </button>
            <button
              type="button"
              onClick={() => setSelected(new Set())}
              className="min-h-11 rounded-full px-3 text-sm font-medium text-zinc-600 underline-offset-2 hover:underline"
            >
              Bỏ chọn
            </button>
            <span className="ml-auto self-center text-sm text-zinc-500">Đã chọn {selected.size}</span>
          </div>

          <div className="mt-2 space-y-5">
            {groups.map((g) => (
              <fieldset key={g.title}>
                <legend className="text-sm font-semibold text-zinc-800 dark:text-zinc-200">{g.title}</legend>
                <div className="mt-2 flex flex-wrap gap-2">
                  {g.items.map((name) => (
                    <Chip key={name} active={selected.has(name)} onClick={() => toggleFood(name)}>
                      {selected.has(name) ? "✓ " : ""}
                      {name}
                    </Chip>
                  ))}
                </div>
              </fieldset>
            ))}
          </div>
        </div>
      )}

      {/* ---------- BƯỚC 3 ---------- */}
      {step === 2 && target && targets && (
        <div className="mt-6 space-y-4">
          <h2 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">Thực đơn của bạn</h2>
          <p className="text-sm text-zinc-600 dark:text-zinc-400">
            Khẩu phần đã được điều chỉnh để vừa {target} kcal/ngày. Bấm “Đổi món” nếu muốn món khác.
          </p>

          {plan.map((p) => (
            <MealEntryCard
              key={p.meal}
              meal={p.meal}
              title={mealLabel(p.meal)}
              target={targets[p.meal]}
              entry={p.entry}
              emptyText="Chưa có món phù hợp với thực phẩm bạn chọn. Hãy quay lại bước 2 và chọn thêm."
            >
              {p.pick && p.pick.missing.length > 0 && (
                <p className="mt-3 rounded-lg bg-amber-50 px-3 py-2 text-sm text-amber-800 dark:bg-amber-950 dark:text-amber-200">
                  Cần mua thêm: {p.pick.missing.join(", ")}
                </p>
              )}
              {p.count > 1 && (
                <button
                  type="button"
                  onClick={() => setChoiceIndex((c) => ({ ...c, [p.meal]: c[p.meal] + 1 }))}
                  className="mt-3 inline-flex min-h-11 items-center rounded-xl border border-zinc-300 px-4 text-sm font-medium text-zinc-700 hover:border-emerald-600 hover:text-emerald-700 dark:border-zinc-700 dark:text-zinc-200"
                >
                  🔄 Đổi món ({(choiceIndex[p.meal] % p.count) + 1}/{p.count})
                </button>
              )}
            </MealEntryCard>
          ))}

          <NutritionTotals totals={totals} target={target} />

          {saveError && (
            <p role="alert" className="rounded-xl bg-red-50 p-3 text-sm text-red-700 dark:bg-red-950 dark:text-red-300">
              {saveError}
            </p>
          )}
        </div>
      )}

      {/* Nút điều hướng */}
      <div className="sticky bottom-0 -mx-4 mt-8 flex gap-3 border-t border-zinc-200 bg-white/95 px-4 py-3 backdrop-blur dark:border-zinc-800 dark:bg-zinc-950/95">
        {step > 0 && (
          <button
            type="button"
            onClick={() => goTo(step - 1)}
            disabled={saving}
            className="min-h-12 rounded-full border border-zinc-300 px-5 font-medium text-zinc-700 disabled:opacity-50 dark:border-zinc-700 dark:text-zinc-200"
          >
            ← Quay lại
          </button>
        )}
        {step < 2 ? (
          <button
            type="button"
            onClick={() => {
              if (step === 1) setChoiceIndex({ breakfast: 0, lunch: 0, dinner: 0 });
              goTo(step + 1);
            }}
            disabled={!canNext}
            className="min-h-12 flex-1 rounded-full bg-emerald-600 px-5 font-semibold text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:bg-zinc-300 dark:disabled:bg-zinc-700"
          >
            {step === 1 && selected.size === 0 ? "Chọn ít nhất 1 thực phẩm" : "Tiếp tục →"}
          </button>
        ) : (
          <button
            type="button"
            onClick={onSave}
            disabled={saving || !plan.some((p) => p.entry)}
            className="min-h-12 flex-1 rounded-full bg-emerald-600 px-5 font-semibold text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:bg-zinc-400"
          >
            {saving ? "Đang lưu…" : "💾 Lưu thực đơn"}
          </button>
        )}
      </div>
    </div>
  );
}
