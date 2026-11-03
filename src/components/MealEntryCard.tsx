import Link from "next/link";
import type { ReactNode } from "react";

import { formatServings, type MealEntry } from "@/lib/meal-plan";

const MEAL_ICON: Record<string, string> = { breakfast: "🌅", lunch: "☀️", dinner: "🌙" };

type Props = {
  meal: string; // breakfast | lunch | dinner
  title: string; // "Bữa sáng"...
  target?: number; // calo mục tiêu của bữa (nếu có)
  entry: MealEntry | null;
  emptyText?: string;
  children?: ReactNode; // nút/ghi chú thêm (ví dụ "Đổi món")
};

// Thẻ 1 bữa ăn: tên món, khẩu phần, calo. Dùng ở bước 3 và trang /thuc-don/[id].
export function MealEntryCard({ meal, title, target, entry, emptyText, children }: Props) {
  return (
    <section className="rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
      <div className="flex items-baseline justify-between gap-2">
        <h3 className="text-sm font-semibold uppercase tracking-wide text-emerald-700 dark:text-emerald-400">
          <span aria-hidden>{MEAL_ICON[meal]} </span>
          {title}
        </h3>
        {target != null && <span className="text-xs text-zinc-500">Mục tiêu ~{target} kcal</span>}
      </div>

      {entry ? (
        <>
          <Link
            href={`/mon-an/${entry.slug}`}
            className="mt-2 block text-lg font-semibold leading-snug text-zinc-900 hover:text-emerald-700 hover:underline dark:text-zinc-100"
          >
            {entry.name}
          </Link>
          <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
            {formatServings(entry.servings)} khẩu phần ≈ {Math.round(entry.serving_grams * entry.servings)} g
          </p>
          <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-sm">
            <span className="font-semibold text-zinc-900 dark:text-zinc-100">🔥 {entry.total_calories} kcal</span>
            <span className="text-zinc-500">Đạm {entry.protein} g</span>
            <span className="text-zinc-500">Tinh bột {entry.carbs} g</span>
            <span className="text-zinc-500">Béo {entry.fat} g</span>
          </div>
        </>
      ) : (
        <p className="mt-2 text-zinc-600 dark:text-zinc-400">{emptyText ?? "Không có món."}</p>
      )}

      {children}
    </section>
  );
}
