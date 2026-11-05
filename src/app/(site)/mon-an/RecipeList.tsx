"use client";

import { useState, type CSSProperties } from "react";

import { RecipeCard } from "@/components/RecipeCard";
import { Icon, Icons, MEAL_ICONS, type LucideIcon } from "@/components/icons";
import { buttonClass, EmptyState } from "@/components/ui";
import type { Meal, RecipeCardData, RecipeKind } from "@/sanity/lib/recipes";
import { MEAL_OPTIONS } from "@/sanity/meals";

type MealFilter = "all" | Meal;
type KindFilter = "all" | RecipeKind;

const PAGE_SIZE = 24; // hiện dần để màn hình điện thoại không quá dài

const KIND_OPTIONS: { value: KindFilter; title: string; icon: LucideIcon }[] = [
  { value: "all", title: "Tất cả", icon: Icons.allMeals },
  { value: "home", title: "Tự nấu", icon: Icons.dish },
  { value: "eatout", title: "Ăn ngoài", icon: Icons.eatOut },
];

function FilterButton({
  active,
  onClick,
  icon,
  title,
  count,
}: {
  active: boolean;
  onClick: () => void;
  icon: LucideIcon;
  title: string;
  count: number;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={`inline-flex min-h-12 shrink-0 items-center gap-1.5 rounded-2xl border-[1.5px] px-4 text-sm font-semibold transition duration-200 active:translate-y-px ${
        active
          ? "border-brand-600 bg-brand-600 text-white"
          : "border-line bg-white text-ink hover:border-brand-300 hover:bg-brand-50"
      }`}
    >
      <Icon icon={icon} size={18} />
      {title}
      <span className={`rounded-md px-1.5 text-xs ${active ? "bg-white/20 text-white" : "bg-brand-50 text-brand-700"}`}>
        {count}
      </span>
    </button>
  );
}

const rowClass = "-mx-4 flex gap-2 overflow-x-auto px-4 pb-2 [scrollbar-width:none] sm:mx-0 sm:flex-wrap sm:px-0";

// Danh sách thẻ món + 2 hàng lọc (loại món, bữa). Lọc ngay trên trình duyệt.
export function RecipeList({ recipes }: { recipes: RecipeCardData[] }) {
  const [kind, setKind] = useState<KindFilter>("all");
  const [meal, setMeal] = useState<MealFilter>("all");
  const [limit, setLimit] = useState(PAGE_SIZE);

  const byKind = (k: KindFilter) => (k === "all" ? recipes : recipes.filter((r) => (r.kind ?? "home") === k));
  const byMeal = (list: RecipeCardData[], m: MealFilter) => (m === "all" ? list : list.filter((r) => r.meals?.includes(m)));

  const kindList = byKind(kind);
  const filtered = byMeal(kindList, meal);
  const shown = filtered.slice(0, limit);

  const pickKind = (k: KindFilter) => {
    setKind(k);
    setLimit(PAGE_SIZE);
  };
  const pickMeal = (m: MealFilter) => {
    setMeal(m);
    setLimit(PAGE_SIZE);
  };

  return (
    <>
      <div role="group" aria-label="Lọc theo loại món" className={rowClass}>
        {KIND_OPTIONS.map((o) => (
          <FilterButton
            key={o.value}
            active={kind === o.value}
            onClick={() => pickKind(o.value)}
            icon={o.icon}
            title={o.title}
            count={byMeal(byKind(o.value), meal).length}
          />
        ))}
      </div>
      <div role="group" aria-label="Lọc theo bữa" className={`mt-2 ${rowClass}`}>
        {[{ value: "all" as MealFilter, title: "Mọi bữa" }, ...MEAL_OPTIONS.map((o) => ({ value: o.value as MealFilter, title: o.title }))].map(
          (o) => (
            <FilterButton
              key={o.value}
              active={meal === o.value}
              onClick={() => pickMeal(o.value)}
              icon={MEAL_ICONS[o.value]}
              title={o.title}
              count={byMeal(kindList, o.value).length}
            />
          ),
        )}
      </div>

      <p className="mt-3 text-sm text-muted" aria-live="polite">
        Đang hiện {shown.length} / {filtered.length} món
        {kind === "eatout" && " · calo ước tính cho 1 phần thường bán"}
      </p>

      {filtered.length > 0 ? (
        <>
          <ul key={`${kind}-${meal}`} className="stagger mt-3 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {shown.map((r, i) => (
              <li key={r._id} style={{ "--i": Math.min(i % PAGE_SIZE, 8) } as CSSProperties}>
                <RecipeCard recipe={r} />
              </li>
            ))}
          </ul>
          {filtered.length > shown.length && (
            <div className="mt-6 text-center">
              <button
                type="button"
                onClick={() => setLimit((n) => n + PAGE_SIZE)}
                className={buttonClass("secondary", "md", "w-full sm:w-auto")}
              >
                Xem thêm {Math.min(PAGE_SIZE, filtered.length - shown.length)} món
              </button>
            </div>
          )}
        </>
      ) : (
        <div className="mt-3">
          <EmptyState
            icon={Icons.bowl}
            title="Chưa có món phù hợp"
            action={
              <button
                type="button"
                onClick={() => {
                  pickKind("all");
                  pickMeal("all");
                }}
                className={buttonClass("secondary")}
              >
                Xem tất cả món
              </button>
            }
          >
            Chúng tôi đang bổ sung thêm món mới. Bạn thử bỏ bớt bộ lọc nhé!
          </EmptyState>
        </div>
      )}
    </>
  );
}
