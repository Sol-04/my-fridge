import Link from "next/link";

import { RecipeImage } from "@/components/RecipeImage";
import type { RecipeCardData } from "@/sanity/lib/recipes";
import { mealLabel } from "@/sanity/meals";

// Thẻ món ăn: ảnh, tên, calo, thời gian nấu. Bấm vào để xem chi tiết.
export function RecipeCard({ recipe }: { recipe: RecipeCardData }) {
  return (
    <Link
      href={`/mon-an/${recipe.slug}`}
      className="group block overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-sm transition hover:shadow-md focus-visible:outline-2 focus-visible:outline-emerald-600 dark:border-zinc-800 dark:bg-zinc-900"
    >
      <RecipeImage
        image={recipe.image}
        name={recipe.name}
        width={600}
        sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
      />
      <div className="p-4">
        <h2 className="text-lg font-semibold leading-snug text-zinc-900 group-hover:text-emerald-700 dark:text-zinc-100">
          {recipe.name}
        </h2>
        <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-sm text-zinc-600 dark:text-zinc-400">
          <span>🔥 {recipe.calories} kcal</span>
          <span>⏱ {recipe.cookMinutes} phút</span>
        </div>
        <div className="mt-3 flex flex-wrap gap-2">
          {recipe.meals?.map((m) => (
            <span
              key={m}
              className="rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-medium text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300"
            >
              {mealLabel(m)}
            </span>
          ))}
        </div>
      </div>
    </Link>
  );
}
