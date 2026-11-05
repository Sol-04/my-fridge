"use client";

import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState, useTransition } from "react";

import { Chip, NumberField } from "@/components/form";
import { Icon, Icons } from "@/components/icons";
import { MealEntryCard } from "@/components/MealEntryCard";
import { buttonClass, cardClass, EmptyState, Notice, PendingDots } from "@/components/ui";
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
  type UserInput,
} from "@/lib/meal-plan";
import type { Meal, PlannerRecipe } from "@/sanity/lib/recipes";
import { mealLabel } from "@/sanity/meals";

import { saveMealPlan } from "./actions";

const STEPS = ["Thông tin", "Thực phẩm", "Thực đơn"];

// Lưu tạm thực đơn đang làm khi phải chuyển sang trang đăng nhập (chỉ trong trình duyệt này)
const DRAFT_KEY = "myfridge-planner-draft";
type Draft = {
  gender: Gender;
  age: string;
  height: string;
  weight: string;
  activity: Activity;
  goal: Goal;
  selected: string[];
  choiceIndex: Record<Meal, number>;
};

export function Planner({
  recipes,
  isLoggedIn,
  profileInput,
}: {
  recipes: PlannerRecipe[];
  isLoggedIn: boolean;
  profileInput: UserInput | null; // thông tin từ hồ sơ để tự điền bước 1
}) {
  const router = useRouter();
  const [step, setStep] = useState(0);

  // Bước 1 (tự điền từ hồ sơ nếu có)
  const [gender, setGender] = useState<Gender>(profileInput?.gender ?? "female");
  const [age, setAge] = useState(profileInput ? String(profileInput.age) : "");
  const [height, setHeight] = useState(profileInput ? String(profileInput.heightCm) : "");
  const [weight, setWeight] = useState(profileInput ? String(profileInput.weightKg) : "");
  const [activity, setActivity] = useState<Activity>(profileInput?.activity ?? "light");
  const [goal, setGoal] = useState<Goal>(profileInput?.goal ?? "lose");

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
  const [restored, setRestored] = useState(false);

  // Quay lại sau khi đăng nhập: khôi phục thực đơn đang làm và mở lại bước 3
  useEffect(() => {
    let draft: Draft | null = null;
    try {
      const raw = sessionStorage.getItem(DRAFT_KEY);
      if (raw) {
        sessionStorage.removeItem(DRAFT_KEY);
        draft = JSON.parse(raw) as Draft;
      }
    } catch {
      draft = null;
    }
    if (!draft) return;
    /* eslint-disable react-hooks/set-state-in-effect -- khôi phục 1 lần từ bộ nhớ trình duyệt */
    setGender(draft.gender);
    setAge(draft.age);
    setHeight(draft.height);
    setWeight(draft.weight);
    setActivity(draft.activity);
    setGoal(draft.goal);
    setSelected(new Set(draft.selected));
    setChoiceIndex(draft.choiceIndex);
    setStep(2);
    setRestored(true);
    /* eslint-enable react-hooks/set-state-in-effect */
  }, []);

  // Chưa đăng nhập: lưu tạm thực đơn rồi chuyển sang trang đăng nhập
  const goLoginToSave = () => {
    const draft: Draft = { gender, age, height, weight, activity, goal, selected: [...selected], choiceIndex };
    try {
      sessionStorage.setItem(DRAFT_KEY, JSON.stringify(draft));
    } catch {
      // Trình duyệt chặn lưu tạm: vẫn cho đăng nhập, chỉ là phải chọn lại
    }
    router.push("/dang-nhap?next=/tao-thuc-don");
  };

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
        if (res?.needLogin) return goLoginToSave();
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
      <ol className={`flex items-start gap-2 p-3 ${cardClass}`} aria-label="Các bước">
        {STEPS.map((label, i) => {
          const done = i < step;
          const current = i === step;
          return (
            <li key={label} className="flex flex-1 flex-col items-center gap-1 text-center" aria-current={current ? "step" : undefined}>
              <span
                className={`flex h-9 w-9 items-center justify-center rounded-full text-sm font-bold transition-colors duration-200 ${
                  current ? "bg-brand-600 text-white" : done ? "bg-aqua-100 text-aqua-800" : "bg-canvas text-muted"
                }`}
              >
                {done ? <Icon icon={Icons.check} size={18} strokeWidth={2.25} /> : i + 1}
              </span>
              <span className={`text-xs ${current ? "font-semibold text-brand-700" : "text-muted"}`}>{label}</span>
            </li>
          );
        })}
      </ol>

      {/* ---------- BƯỚC 1 ---------- */}
      {step === 0 && (
        <div key="b1" className="animate-enter mt-6 space-y-6">
          <h2 className="text-2xl font-bold tracking-tight text-ink">Thông tin của bạn</h2>
          {profileInput && (
            <Notice tone="info" icon={Icons.sparkles}>
              Đã điền sẵn từ hồ sơ của bạn. Bạn vẫn có thể sửa cho lần này.
            </Notice>
          )}

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
                  stacked
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
                <p className="flex items-center gap-1.5 text-sm text-brand-50">
                  <Icon icon={Icons.target} size={16} />
                  Calo mục tiêu mỗi ngày
                </p>
                <p className="text-4xl font-bold">{target} kcal</p>
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
        <div className="animate-enter mt-6">
          <h2 className="text-2xl font-bold tracking-tight text-ink">Bạn đang có thực phẩm gì?</h2>
          <p className="mt-1 text-sm text-muted">
            Chạm để chọn. Gia vị cơ bản (dầu ăn, nước mắm, hành, tỏi, gừng…) đã được tính sẵn.
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => setSelected(new Set(allFoods))}
              className="min-h-11 rounded-xl px-3 text-sm font-semibold text-brand-700 underline-offset-2 hover:underline"
            >
              Chọn tất cả
            </button>
            <button
              type="button"
              onClick={() => setSelected(new Set())}
              className="min-h-11 rounded-xl px-3 text-sm font-semibold text-muted underline-offset-2 hover:underline"
            >
              Bỏ chọn
            </button>
            <span className="ml-auto self-center text-sm text-muted">Đã chọn {selected.size}</span>
          </div>

          {selected.size === 0 && (
            <div className="mt-3 flex items-center gap-3 rounded-2xl border-[1.5px] border-dashed border-line bg-white p-3">
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-aqua-50 text-aqua-800">
                <Icon icon={Icons.foods} size={22} strokeWidth={1.5} />
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
                      {selected.has(name) && <Icon icon={Icons.check} size={16} strokeWidth={2.25} />}
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
        <div className="animate-enter mt-6 space-y-4">
          <h2 className="text-2xl font-bold tracking-tight text-ink">Thực đơn của bạn</h2>
          <p className="text-sm text-muted">
            Khẩu phần đã được điều chỉnh để vừa {target} kcal/ngày. Bấm “Đổi món” nếu muốn món khác.
          </p>

          {!plan.some((p) => p.entry) && (
            <EmptyState
              icon={Icons.notFound}
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
                  <Icon icon={Icons.swap} size={18} />
                  Đổi món ({(choiceIndex[p.meal] % p.count) + 1}/{p.count})
                </button>
              )}
            </MealEntryCard>
          ))}

          <NutritionTotals totals={totals} target={target} />

          {restored && isLoggedIn && (
            <Notice tone="success">Bạn đã đăng nhập. Thực đơn vẫn được giữ nguyên — bấm “Lưu thực đơn” để lưu nhé.</Notice>
          )}
          {!isLoggedIn && (
            <Notice tone="info" icon={Icons.lock} title="Đăng nhập để lưu thực đơn">
              Tạo tài khoản miễn phí để lưu thực đơn, xem lại trong hồ sơ và gửi link cho người thân. Thực đơn đang
              làm sẽ được giữ nguyên khi bạn quay lại.
            </Notice>
          )}

          {saveError && (
            <Notice tone="error" title="Chưa lưu được thực đơn">
              {saveError}
            </Notice>
          )}
        </div>
      )}

      {/* Nút điều hướng */}
      <div className="sticky bottom-0 z-[100] -mx-4 mt-8 flex gap-3 border-t border-line bg-white/95 px-4 pt-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] backdrop-blur">
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
            onClick={isLoggedIn ? onSave : goLoginToSave}
            disabled={saving || !plan.some((p) => p.entry)}
            className={buttonClass("primary", "md", "flex-1")}
          >
            {saving ? (
              <>
                Đang lưu…
                <PendingDots />
              </>
            ) : (
              <>
                <Icon icon={isLoggedIn ? Icons.save : Icons.lock} size={18} />
                {isLoggedIn ? "Lưu thực đơn" : "Đăng nhập để lưu"}
              </>
            )}
          </button>
        )}
      </div>
    </div>
  );
}
