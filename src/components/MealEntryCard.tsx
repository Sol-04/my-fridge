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
    <section className="rounded-3xl bg-white p-5 shadow-sm ring-1 ring-brand-100">
      <div className="flex items-center justify-between gap-2">
        <h3 className="flex items-center gap-2 text-sm font-bold text-brand-700">
          <span aria-hidden className="flex h-8 w-8 items-center justify-center rounded-full bg-brand-50 text-base">
            {MEAL_ICON[meal]}
          </span>
          {title}
        </h3>
        {target != null && (
          <span className="rounded-full bg-canvas px-2.5 py-1 text-xs font-medium text-muted">Mục tiêu ~{target} kcal</span>
        )}
      </div>

      {entry ? (
        <>
          <Link
            href={`/mon-an/${entry.slug}`}
            className="mt-2 flex min-h-11 items-center text-lg leading-snug font-bold text-ink hover:text-brand-700 hover:underline"
          >
            {entry.name}
          </Link>
          <p className="text-sm text-muted">
            {formatServings(entry.servings)} khẩu phần ≈ {Math.round(entry.serving_grams * entry.servings)} g
          </p>
          <div className="mt-3 flex flex-wrap gap-2 text-sm">
            <span className="rounded-full bg-accent-50 px-2.5 py-1 font-bold text-accent-500">🔥 {entry.total_calories} kcal</span>
            <span className="rounded-full bg-canvas px-2.5 py-1 text-muted">Đạm {entry.protein} g</span>
            <span className="rounded-full bg-canvas px-2.5 py-1 text-muted">Tinh bột {entry.carbs} g</span>
            <span className="rounded-full bg-canvas px-2.5 py-1 text-muted">Béo {entry.fat} g</span>
          </div>
        </>
      ) : (
        <p className="mt-3 rounded-2xl bg-canvas p-3 text-sm text-muted">{emptyText ?? "Không có món."}</p>
      )}

      {children}
    </section>
  );
}
