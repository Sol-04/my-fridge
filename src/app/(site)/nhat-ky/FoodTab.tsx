"use client";

import Link from "next/link";
import { useState } from "react";

import { Chip, TextField } from "@/components/form";
import { Icon, Icons, MEAL_ICONS } from "@/components/icons";
import { buttonClass, cardClass, Notice, PendingDots } from "@/components/ui";
import { DIARY_MEALS, DIARY_SERVINGS, plainText, type DiaryMeal, type FoodLog } from "@/lib/diary";
import { formatServings } from "@/lib/meal-plan";

import { addFoodLog, deleteFoodLog, updateFoodServings } from "./actions";
import { selectClass, useDiaryRun } from "./useDiaryRun";

export type DiaryRecipe = { slug: string; name: string; calories: number; meals: string[]; kind: string };

const kcalBadge = "inline-flex items-center gap-1 rounded-lg bg-accent-50 px-2 py-1 text-sm font-bold text-accent-500";

export function FoodTab({ date, foods, recipes }: { date: string; foods: FoodLog[]; recipes: DiaryRecipe[] }) {
  return (
    <div className="stagger space-y-4">
      {DIARY_MEALS.map((m, i) => (
        <MealCard key={m.value} index={i} date={date} meal={m.value} label={m.label} logs={foods.filter((f) => f.meal === m.value)} recipes={recipes} />
      ))}
    </div>
  );
}

function MealCard({
  index,
  date,
  meal,
  label,
  logs,
  recipes,
}: {
  index: number;
  date: string;
  meal: DiaryMeal;
  label: string;
  logs: FoodLog[];
  recipes: DiaryRecipe[];
}) {
  const [open, setOpen] = useState(false);
  const { pending, error, run } = useDiaryRun();
  const total = Math.round(logs.reduce((s, l) => s + l.calories, 0));

  return (
    <section aria-labelledby={`meal-${meal}`} className={`animate-enter p-4 sm:p-5 ${cardClass}`} style={{ "--i": index } as React.CSSProperties}>
      <div className="flex items-center gap-3">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-aqua-50 text-aqua-800">
          <Icon icon={MEAL_ICONS[meal]} size={20} />
        </span>
        <h2 id={`meal-${meal}`} className="min-w-0 flex-1 text-lg font-bold text-ink">
          {label}
        </h2>
        <span className={kcalBadge}>
          <Icon icon={Icons.calories} size={14} />
          {total} kcal
        </span>
      </div>

      {error && (
        <div className="mt-3">
          <Notice tone="error">{error}</Notice>
        </div>
      )}

      {logs.length === 0 ? (
        <p className="mt-3 text-sm text-muted">Chưa ghi món nào</p>
      ) : (
        <ul className="mt-3 divide-y divide-line">
          {logs.map((l) => (
            <li key={l.id} className="py-3 first:pt-0">
              {l.recipe_slug ? (
                <Link href={`/mon-an/${l.recipe_slug}`} className="font-semibold text-brand-700 underline-offset-2 hover:underline">
                  {l.name}
                </Link>
              ) : (
                <p className="font-semibold text-ink">{l.name}</p>
              )}
              <div className="mt-1.5 flex flex-wrap items-center gap-2">
                {l.recipe_slug ? (
                  <label className="flex items-center gap-2 text-sm text-muted">
                    <span className="sr-only">Số phần của {l.name}</span>
                    <select
                      value={l.servings}
                      disabled={pending}
                      onChange={(e) => run(() => updateFoodServings(l.id, Number(e.target.value)))}
                      className={`${selectClass} min-h-11 w-auto py-1`}
                    >
                      {(DIARY_SERVINGS.includes(l.servings) ? DIARY_SERVINGS : [...DIARY_SERVINGS, l.servings].sort((a, b) => a - b)).map((s) => (
                        <option key={s} value={s}>
                          {formatServings(s)} phần
                        </option>
                      ))}
                    </select>
                  </label>
                ) : (
                  <span className="text-sm text-muted">Tự nhập</span>
                )}
                <span className={kcalBadge}>
                  <Icon icon={Icons.calories} size={14} />
                  {Math.round(l.calories)} kcal
                </span>
                <button
                  type="button"
                  disabled={pending}
                  onClick={() => run(() => deleteFoodLog(l.id))}
                  className="ml-auto inline-flex min-h-11 min-w-11 items-center justify-center rounded-2xl text-muted transition duration-200 hover:bg-red-50 hover:text-red-700 disabled:opacity-60"
                >
                  <Icon icon={Icons.trash} size={18} />
                  <span className="sr-only">Xoá {l.name}</span>
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}

      <div className="mt-3">
        {open ? (
          <AddPanel
            date={date}
            meal={meal}
            recipes={recipes}
            onClose={() => setOpen(false)}
            onAdded={() => setOpen(false)}
          />
        ) : (
          <button type="button" onClick={() => setOpen(true)} className={buttonClass("secondary", "md", "w-full sm:w-auto")}>
            <Icon icon={Icons.add} size={18} />
            Thêm món
          </button>
        )}
      </div>
    </section>
  );
}

function AddPanel({
  date,
  meal,
  recipes,
  onClose,
  onAdded,
}: {
  date: string;
  meal: DiaryMeal;
  recipes: DiaryRecipe[];
  onClose: () => void;
  onAdded: () => void;
}) {
  const [mode, setMode] = useState<"recipe" | "custom">("recipe");
  return (
    <div className="rounded-2xl border border-line bg-canvas p-3 sm:p-4">
      <div role="group" aria-label="Cách thêm món" className="grid grid-cols-2 gap-2">
        <Chip active={mode === "recipe"} onClick={() => setMode("recipe")}>
          Món có sẵn
        </Chip>
        <Chip active={mode === "custom"} onClick={() => setMode("custom")}>
          Tự nhập
        </Chip>
      </div>
      <div className="mt-3">
        {mode === "recipe" ? (
          <RecipePicker date={date} meal={meal} recipes={recipes} onAdded={onAdded} />
        ) : (
          <CustomFood date={date} meal={meal} onAdded={onAdded} />
        )}
      </div>
      <button type="button" onClick={onClose} className={buttonClass("ghost", "md", "mt-3 w-full")}>
        Đóng
      </button>
    </div>
  );
}

function RecipePicker({ date, meal, recipes, onAdded }: { date: string; meal: DiaryMeal; recipes: DiaryRecipe[]; onAdded: () => void }) {
  const [q, setQ] = useState("");
  const query = plainText(q.trim());
  const matches = recipes
    .filter((r) => !query || plainText(r.name).includes(query))
    .sort((a, b) => Number(b.meals.includes(meal)) - Number(a.meals.includes(meal)))
    .slice(0, 8);

  return (
    <div>
      <TextField label="Tìm món" type="search" value={q} onChange={(e) => setQ(e.target.value)} placeholder="Ví dụ: cháo, phở, trứng…" autoComplete="off" />
      {matches.length === 0 ? (
        <p className="mt-3 text-sm text-muted">Không thấy món nào khớp. Bạn thử từ khoá khác hoặc chọn “Tự nhập” nhé.</p>
      ) : (
        <ul className="mt-3 space-y-2">
          {matches.map((r) => (
            <RecipeRow key={r.slug} recipe={r} date={date} meal={meal} onAdded={onAdded} />
          ))}
        </ul>
      )}
    </div>
  );
}

function RecipeRow({ recipe, date, meal, onAdded }: { recipe: DiaryRecipe; date: string; meal: DiaryMeal; onAdded: () => void }) {
  const [servings, setServings] = useState(1);
  const { pending, error, run } = useDiaryRun();
  return (
    <li className="rounded-2xl border border-line bg-white p-3">
      <p className="font-semibold text-ink">{recipe.name}</p>
      <p className="mt-0.5 text-sm text-muted">
        <span className="font-bold text-accent-500">{recipe.calories} kcal</span> / phần
        {recipe.kind === "eatout" && " · Ăn ngoài"}
      </p>
      {error && (
        <div className="mt-2">
          <Notice tone="error">{error}</Notice>
        </div>
      )}
      <div className="mt-2 flex items-center gap-2">
        <label className="min-w-0 flex-1">
          <span className="sr-only">Số phần của {recipe.name}</span>
          <select value={servings} onChange={(e) => setServings(Number(e.target.value))} className={`${selectClass} min-h-11`}>
            {DIARY_SERVINGS.map((s) => (
              <option key={s} value={s}>
                {formatServings(s)} phần
              </option>
            ))}
          </select>
        </label>
        <button
          type="button"
          disabled={pending}
          onClick={() => run(() => addFoodLog({ date, meal, recipeSlug: recipe.slug, servings }), onAdded)}
          className={buttonClass("primary", "md", "min-h-11 shrink-0")}
        >
          {pending ? <PendingDots /> : "Thêm"}
          <span className="sr-only">{recipe.name} vào nhật ký</span>
        </button>
      </div>
    </li>
  );
}

function CustomFood({ date, meal, onAdded }: { date: string; meal: DiaryMeal; onAdded: () => void }) {
  const [name, setName] = useState("");
  const [calories, setCalories] = useState("");
  const [protein, setProtein] = useState("");
  const [carbs, setCarbs] = useState("");
  const [fat, setFat] = useState("");
  const { pending, error, run } = useDiaryRun();
  const opt = (v: string) => (v.trim() === "" ? null : Number(v));

  return (
    <form
      className="space-y-3"
      onSubmit={(e) => {
        e.preventDefault();
        run(
          () => addFoodLog({ date, meal, name, calories: Number(calories), protein: opt(protein), carbs: opt(carbs), fat: opt(fat) }),
          onAdded,
        );
      }}
    >
      <TextField label="Tên món" value={name} onChange={(e) => setName(e.target.value)} maxLength={120} required />
      <TextField label="Calo (kcal)" type="number" inputMode="decimal" min={0} max={5000} value={calories} onChange={(e) => setCalories(e.target.value)} required />
      <p className="text-sm text-muted">Không bắt buộc:</p>
      <div className="grid grid-cols-3 gap-2">
        <TextField label="Đạm (g)" type="number" inputMode="decimal" min={0} value={protein} onChange={(e) => setProtein(e.target.value)} />
        <TextField label="Tinh bột (g)" type="number" inputMode="decimal" min={0} value={carbs} onChange={(e) => setCarbs(e.target.value)} />
        <TextField label="Béo (g)" type="number" inputMode="decimal" min={0} value={fat} onChange={(e) => setFat(e.target.value)} />
      </div>
      {error && <Notice tone="error">{error}</Notice>}
      <button type="submit" disabled={pending || !name.trim() || calories === ""} className={buttonClass("primary", "md", "w-full")}>
        {pending ? (
          <>
            Đang lưu…
            <PendingDots />
          </>
        ) : (
          "Thêm vào bữa"
        )}
      </button>
    </form>
  );
}
