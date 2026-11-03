import Link from "next/link";

import { RecipeImage } from "@/components/RecipeImage";
import type { RecipeCardData } from "@/sanity/lib/recipes";
import { mealLabel } from "@/sanity/meals";

// Thẻ món ăn: ảnh, tên, calo, thời gian nấu. Bấm vào để xem chi tiết.
export function RecipeCard({ recipe }: { recipe: RecipeCardData }) {
  return (
    <Link
      href={`/mon-an/${recipe.slug}`}
      className="group flex h-full flex-col overflow-hidden rounded-3xl bg-white shadow-sm ring-1 ring-brand-100 transition hover:-translate-y-0.5 hover:shadow-md hover:ring-brand-200"
    >
      <div className="relative">
        <RecipeImage
          image={recipe.image}
          name={recipe.name}
          width={600}
          sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
        />
        <div className="absolute top-3 left-3 flex flex-wrap gap-1.5">
          {recipe.meals?.map((m) => (
            <span key={m} className="rounded-full bg-white/95 px-2.5 py-1 text-xs font-semibold text-brand-700 shadow-sm">
              {mealLabel(m)}
            </span>
          ))}
        </div>
      </div>
      <div className="flex flex-1 flex-col p-4">
        <h2 className="text-lg leading-snug font-bold text-ink group-hover:text-brand-700">{recipe.name}</h2>
        <div className="mt-auto flex flex-wrap gap-2 pt-3 text-sm">
          <span className="rounded-full bg-accent-50 px-2.5 py-1 font-semibold text-accent-500">🔥 {recipe.calories} kcal</span>
          <span className="rounded-full bg-canvas px-2.5 py-1 font-medium text-muted">⏱ {recipe.cookMinutes} phút</span>
        </div>
      </div>
    </Link>
  );
}
