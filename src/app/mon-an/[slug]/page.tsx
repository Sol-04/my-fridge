import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { RecipeImage } from "@/components/RecipeImage";
import { getRecipe, getRecipeSlugs } from "@/sanity/lib/recipes";
import { mealLabel } from "@/sanity/meals";

// Tạo sẵn trang cho mọi món khi build (Next.js yêu cầu ít nhất 1 giá trị).
export async function generateStaticParams() {
  const slugs = await getRecipeSlugs();
  if (slugs.length === 0) return [{ slug: "chua-co-mon" }];
  return slugs.map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: PageProps<"/mon-an/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const recipe = await getRecipe(slug);
  if (!recipe) return { title: "Không tìm thấy món – My Fridge" };
  return {
    title: `${recipe.name} – My Fridge`,
    description: recipe.description,
  };
}

export default async function RecipePage({ params }: PageProps<"/mon-an/[slug]">) {
  const { slug } = await params;
  const recipe = await getRecipe(slug);
  if (!recipe) notFound();

  const nutrition = [
    { label: "Calo", value: `${recipe.calories} kcal` },
    { label: "Chất đạm", value: `${recipe.protein} g` },
    { label: "Tinh bột", value: `${recipe.carbs} g` },
    { label: "Chất béo", value: `${recipe.fat} g` },
  ];

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-6 sm:py-10">
      <Link
        href="/mon-an"
        className="inline-flex min-h-11 items-center text-sm text-emerald-700 hover:underline"
      >
        ← Tất cả món
      </Link>

      <div className="mt-2 overflow-hidden rounded-2xl">
        <RecipeImage
          image={recipe.image}
          name={recipe.name}
          width={1200}
          sizes="(min-width: 768px) 768px, 100vw"
          preload
        />
      </div>

      <h1 className="mt-5 text-3xl font-bold leading-tight tracking-tight text-zinc-900 sm:text-4xl dark:text-zinc-100">
        {recipe.name}
      </h1>
      {recipe.description && (
        <p className="mt-2 text-zinc-600 dark:text-zinc-400">{recipe.description}</p>
      )}
      <div className="mt-3 flex flex-wrap items-center gap-2 text-sm">
        {recipe.meals?.map((m) => (
          <span
            key={m}
            className="rounded-full bg-emerald-50 px-2.5 py-0.5 font-medium text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300"
          >
            {mealLabel(m)}
          </span>
        ))}
        <span className="text-zinc-600 dark:text-zinc-400">⏱ {recipe.cookMinutes} phút</span>
      </div>

      {/* Bảng dinh dưỡng */}
      <section className="mt-8" aria-labelledby="dinh-duong">
        <h2 id="dinh-duong" className="text-xl font-semibold text-zinc-900 dark:text-zinc-100">
          Dinh dưỡng
        </h2>
        <p className="text-sm text-zinc-500">1 khẩu phần ({recipe.servingGrams} g)</p>
        <table className="mt-3 w-full overflow-hidden rounded-xl border border-zinc-200 text-left dark:border-zinc-800">
          <tbody>
            {nutrition.map((n) => (
              <tr key={n.label} className="border-b border-zinc-200 last:border-0 dark:border-zinc-800">
                <th scope="row" className="px-4 py-3 font-normal text-zinc-600 dark:text-zinc-400">
                  {n.label}
                </th>
                <td className="px-4 py-3 text-right font-semibold text-zinc-900 dark:text-zinc-100">
                  {n.value}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      {/* Nguyên liệu */}
      <section className="mt-8" aria-labelledby="nguyen-lieu">
        <h2 id="nguyen-lieu" className="text-xl font-semibold text-zinc-900 dark:text-zinc-100">
          Nguyên liệu
        </h2>
        <ul className="mt-3 divide-y divide-zinc-200 rounded-xl border border-zinc-200 dark:divide-zinc-800 dark:border-zinc-800">
          {recipe.ingredients?.map((ing) => (
            <li key={ing._key} className="flex justify-between gap-4 px-4 py-3">
              <span className="text-zinc-800 dark:text-zinc-200">{ing.name}</span>
              <span className="shrink-0 text-zinc-500">{ing.grams} g</span>
            </li>
          ))}
        </ul>
      </section>

      {/* Các bước nấu */}
      <section className="mt-8" aria-labelledby="cach-nau">
        <h2 id="cach-nau" className="text-xl font-semibold text-zinc-900 dark:text-zinc-100">
          Các bước nấu
        </h2>
        <ol className="mt-3 space-y-4">
          {recipe.steps?.map((step, i) => (
            <li key={i} className="flex gap-3">
              <span
                aria-hidden
                className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-emerald-600 text-sm font-semibold text-white"
              >
                {i + 1}
              </span>
              <p className="pt-1 text-zinc-800 dark:text-zinc-200">{step}</p>
            </li>
          ))}
        </ol>
      </section>
    </main>
  );
}
