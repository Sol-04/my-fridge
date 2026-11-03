"use client";

import { useMemo, useState, useTransition } from "react";

import { MealEntryCard } from "@/components/MealEntryCard";
import { buttonClass, EmptyState, Notice } from "@/components/ui";
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
      className={`min-h-12 rounded-2xl border-2 px-4 text-sm font-semibold transition active:scale-[0.98] ${
        active
          ? "border-brand-600 bg-brand-600 text-white shadow-sm"
          : "border-brand-100 bg-white text-ink hover:border-brand-300"
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
      <span className="text-sm font-semibold text-ink">{label}</span>
      <div className="mt-1 flex items-center gap-2">
        <input
          type="number"
          inputMode="decimal"
          min={limits.min}
          max={limits.max}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          aria-invalid={invalid}
          className={`min-h-14 w-full rounded-2xl border-2 bg-white px-4 text-lg font-semibold text-ink outline-none focus:border-brand-500 ${
            invalid ? "border-red-300 bg-red-50" : "border-brand-100"
          }`}
        />
        <span className="w-8 shrink-0 text-sm text-muted">{unit}</span>
      </div>
      {invalid && (
        <span className="mt-1 block text-sm text-red-700">
          Vui lòng nhập từ {limits.min} đến {limits.max} {unit}
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
        setSaveError("Có thể mạng đang chậm hoặc bị ngắt. Thực đơn vẫn còn nguyên trên màn hình, bạn đợi một chút rồi bấm “Lưu thực đơn” lần nữa nhé.");
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
      <ol className="flex items-start gap-2 rounded-3xl bg-white p-3 ring-1 ring-brand-100" aria-label="Các bước">
        {STEPS.map((label, i) => {
          const done = i < step;
          const current = i === step;
          return (
            <li key={label} className="flex flex-1 flex-col items-center gap-1 text-center" aria-current={current ? "step" : undefined}>
              <span
                className={`flex h-9 w-9 items-center justify-center rounded-full text-sm font-bold ${
                  current ? "bg-brand-600 text-white" : done ? "bg-brand-100 text-brand-700" : "bg-canvas text-muted"
                }`}
              >
                {done ? "✓" : i + 1}
              </span>
              <span className={`text-xs ${current ? "font-semibold text-brand-700" : "text-muted"}`}>{label}</span>
            </li>
          );
        })}
      </ol>

      {/* ---------- BƯỚC 1 ---------- */}
      {step === 0 && (
        <div className="mt-6 space-y-6">
          <h2 className="text-2xl font-extrabold tracking-tight text-ink">Thông tin của bạn</h2>

          <fieldset>
            <legend className="text-sm font-semibold text-ink">Giới tính</legend>
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
            <legend className="text-sm font-semibold text-ink">Mức vận động</legend>
            <div className="mt-1 grid grid-cols-1 gap-2 sm:grid-cols-2">
              {ACTIVITY_OPTIONS.map((o) => (
                <Chip
                  key={o.value}
                  active={activity === o.value}
                  onClick={() => setActivity(o.value)}
                  className="py-2 text-left"
                >
                  <span className="block">{o.label}</span>
                  <span className={`block text-xs font-normal ${activity === o.value ? "text-brand-100" : "text-muted"}`}>
                    {o.hint}
                  </span>
                </Chip>
              ))}
            </div>
          </fieldset>

          <fieldset>
            <legend className="text-sm font-semibold text-ink">Mục tiêu</legend>
            <div className="mt-1 grid grid-cols-3 gap-2">
              {GOAL_OPTIONS.map((o) => (
                <Chip key={o.value} active={goal === o.value} onClick={() => setGoal(o.value)}>
                  {o.label}
                </Chip>
              ))}
            </div>
          </fieldset>

          <div className="rounded-3xl bg-brand-600 p-5 text-white" aria-live="polite">
            {target ? (
              <>
                <p className="text-sm text-brand-100">🎯 Calo mục tiêu mỗi ngày</p>
                <p className="text-4xl font-extrabold">{target} kcal</p>
              </>
            ) : (
              <p className="text-sm text-brand-50">
                Nhập tuổi, chiều cao, cân nặng để xem lượng calo bạn cần mỗi ngày.
              </p>
            )}
          </div>
        </div>
      )}

      {/* ---------- BƯỚC 2 ---------- */}
      {step === 1 && (
        <div className="mt-6">
          <h2 className="text-2xl font-extrabold tracking-tight text-ink">Bạn đang có thực phẩm gì?</h2>
          <p className="mt-1 text-sm text-muted">
            Chạm để chọn. Gia vị cơ bản (dầu ăn, nước mắm, hành, tỏi, gừng…) đã được tính sẵn.
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => setSelected(new Set(allFoods))}
              className="min-h-11 rounded-full px-3 text-sm font-medium text-brand-700 underline-offset-2 hover:underline"
            >
              Chọn tất cả
            </button>
            <button
              type="button"
              onClick={() => setSelected(new Set())}
              className="min-h-11 rounded-full px-3 text-sm font-medium text-muted underline-offset-2 hover:underline"
            >
              Bỏ chọn
            </button>
            <span className="ml-auto self-center text-sm text-muted">Đã chọn {selected.size}</span>
          </div>

          {selected.size === 0 && (
            <div className="mt-3 flex items-center gap-3 rounded-2xl border-2 border-dashed border-brand-200 bg-white p-3">
              <span aria-hidden className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-brand-50 text-2xl">
                🧺
              </span>
              <div className="text-sm">
                <p className="font-semibold text-ink">Bạn chưa chọn thực phẩm nào</p>
                <p className="text-muted">Chạm vào các ô bên dưới. Chọn càng nhiều, gợi ý càng hợp.</p>
              </div>
            </div>
          )}

          <div className="mt-5 space-y-5">
            {groups.map((g) => (
              <fieldset key={g.title}>
                <legend className="text-sm font-semibold text-ink">{g.title}</legend>
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
          <h2 className="text-2xl font-extrabold tracking-tight text-ink">Thực đơn của bạn</h2>
          <p className="text-sm text-muted">
            Khẩu phần đã được điều chỉnh để vừa {target} kcal/ngày. Bấm “Đổi món” nếu muốn món khác.
          </p>

          {!plan.some((p) => p.entry) && (
            <EmptyState
              icon="🤔"
              title="Chưa tìm được món phù hợp"
              action={
                <button type="button" onClick={() => goTo(1)} className={buttonClass("primary")}>
                  Chọn thêm thực phẩm
                </button>
              }
            >
              Thực phẩm bạn chọn chưa đủ để nấu món nào. Hãy chọn thêm vài loại như trứng, rau hoặc cơm gạo lứt nhé.
            </EmptyState>
          )}

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
                <div className="mt-3">
                  <Notice tone="warning">Cần mua thêm: {p.pick.missing.join(", ")}</Notice>
                </div>
              )}
              {p.count > 1 && (
                <button
                  type="button"
                  onClick={() => setChoiceIndex((c) => ({ ...c, [p.meal]: c[p.meal] + 1 }))}
                  className={buttonClass("secondary", "md", "mt-3 w-full sm:w-auto")}
                >
                  🔄 Đổi món ({(choiceIndex[p.meal] % p.count) + 1}/{p.count})
                </button>
              )}
            </MealEntryCard>
          ))}

          <NutritionTotals totals={totals} target={target} />

          {saveError && (
            <Notice tone="error" title="Chưa lưu được thực đơn">
              {saveError}
            </Notice>
          )}
        </div>
      )}

      {/* Nút điều hướng */}
      <div className="sticky bottom-0 -mx-4 mt-8 flex gap-3 border-t border-brand-100 bg-white/95 px-4 pt-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] backdrop-blur">
        {step > 0 && (
          <button
            type="button"
            onClick={() => goTo(step - 1)}
            disabled={saving}
            className={buttonClass("secondary", "md", "px-4")}
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
            className={buttonClass("primary", "md", "flex-1")}
          >
            Tiếp tục →
          </button>
        ) : (
          <button
            type="button"
            onClick={onSave}
            disabled={saving || !plan.some((p) => p.entry)}
            className={buttonClass("primary", "md", "flex-1")}
          >
            {saving ? (
              <>
                <span aria-hidden className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white motion-reduce:animate-none" />
                Đang lưu…
              </>
            ) : (
              "💾 Lưu thực đơn"
            )}
          </button>
        )}
      </div>
    </div>
  );
}
