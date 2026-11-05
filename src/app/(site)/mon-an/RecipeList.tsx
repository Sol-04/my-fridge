"use client";

import { useState } from "react";

import { RecipeCard } from "@/components/RecipeCard";
import { Icon, Icons, MEAL_ICONS } from "@/components/icons";
import { buttonClass, EmptyState } from "@/components/ui";
import type { Meal, RecipeCardData } from "@/sanity/lib/recipes";
import { MEAL_OPTIONS } from "@/sanity/meals";

type Filter = "all" | Meal;

// Danh sách thẻ món + hàng nút lọc theo bữa. Lọc ngay trên trình duyệt.
export function RecipeList({ recipes }: { recipes: RecipeCardData[] }) {
  const [filter, setFilter] = useState<Filter>("all");

  const filters: { value: Filter; title: string; count: number }[] = [
    { value: "all", title: "Tất cả", count: recipes.length },
    ...MEAL_OPTIONS.map((o) => ({
      value: o.value as Meal,
      title: o.title,
      count: recipes.filter((r) => r.meals?.includes(o.value)).length,
    })),
  ];

  const shown = filter === "all" ? recipes : recipes.filter((r) => r.meals?.includes(filter));

  return (
    <>
      <div
        role="group"
        aria-label="Lọc theo bữa"
        className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-2 [scrollbar-width:none] sm:mx-0 sm:flex-wrap sm:px-0"
      >
        {filters.map((f) => {
          const active = f.value === filter;
          return (
            <button
              key={f.value}
              type="button"
              onClick={() => setFilter(f.value)}
              aria-pressed={active}
              className={`inline-flex min-h-12 shrink-0 items-center gap-1.5 rounded-2xl border-[1.5px] px-4 text-sm font-semibold transition duration-200 active:translate-y-px ${
                active
                  ? "border-brand-600 bg-brand-600 text-white"
                  : "border-line bg-white text-ink hover:border-brand-300 hover:bg-brand-50"
              }`}
            >
              <Icon icon={MEAL_ICONS[f.value]} size={18} />
              {f.title}
              <span
                className={`rounded-md px-1.5 text-xs ${active ? "bg-white/20 text-white" : "bg-brand-50 text-brand-700"}`}
              >
                {f.count}
              </span>
            </button>
          );
        })}
      </div>

      <p className="mt-3 text-sm text-muted" aria-live="polite">
        Đang hiện {shown.length} món
      </p>

      {shown.length > 0 ? (
        <ul key={filter} className="stagger mt-3 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {shown.map((r, i) => (
            <li key={r._id} style={{ "--i": Math.min(i, 8) } as React.CSSProperties}>
              <RecipeCard recipe={r} />
            </li>
          ))}
        </ul>
      ) : (
        <div className="mt-3">
          <EmptyState
            icon={Icons.bowl}
            title="Chưa có món cho bữa này"
            action={
              <button type="button" onClick={() => setFilter("all")} className={buttonClass("secondary")}>
                Xem tất cả món
              </button>
            }
          >
            Chúng tôi đang bổ sung thêm món mới. Bạn xem tạm các món khác nhé!
          </EmptyState>
        </div>
      )}
    </>
  );
}
