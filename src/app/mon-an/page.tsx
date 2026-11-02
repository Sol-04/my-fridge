import type { Metadata } from "next";
import Link from "next/link";

import { getRecipes } from "@/sanity/lib/recipes";

import { RecipeList } from "./RecipeList";

export const metadata: Metadata = {
  title: "Món ăn – My Fridge",
  description: "Các món ăn Việt lành mạnh, dễ nấu cho bữa sáng, trưa, tối kèm lượng calo.",
};

export default async function RecipesPage() {
  const recipes = await getRecipes();

  return (
    <main className="mx-auto w-full max-w-5xl px-4 py-6 sm:py-10">
      <Link href="/" className="inline-flex min-h-11 items-center text-sm text-emerald-700 hover:underline">
        ← Trang chủ
      </Link>
      <h1 className="mt-1 text-3xl font-bold tracking-tight text-zinc-900 sm:text-4xl dark:text-zinc-100">
        Món ăn
      </h1>
      <p className="mt-2 text-zinc-600 dark:text-zinc-400">
        Món Việt lành mạnh, dễ nấu. Chọn bữa để lọc nhanh.
      </p>

      <div className="mt-6">
        {recipes.length > 0 ? (
          <RecipeList recipes={recipes} />
        ) : (
          <p className="rounded-xl bg-amber-50 p-4 text-amber-800">
            Chưa tải được món ăn. Vui lòng thử lại sau.
          </p>
        )}
      </div>
    </main>
  );
}
