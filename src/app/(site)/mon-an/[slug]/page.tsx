import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { RecipeImage } from "@/components/RecipeImage";
import { ButtonLink } from "@/components/ui";
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
        className="inline-flex min-h-11 items-center gap-1 rounded-full px-1 text-sm font-medium text-brand-700 hover:underline"
      >
        ← Tất cả món
      </Link>

      <div className="mt-2 overflow-hidden rounded-3xl shadow-sm ring-1 ring-brand-100">
        <RecipeImage
          image={recipe.image}
          name={recipe.name}
          width={1200}
          sizes="(min-width: 768px) 768px, 100vw"
          preload
        />
      </div>

      <div className="mt-5 flex flex-wrap items-center gap-2 text-sm">
        {recipe.meals?.map((m) => (
          <span key={m} className="rounded-full bg-brand-50 px-3 py-1 font-semibold text-brand-700">
            {mealLabel(m)}
          </span>
        ))}
        <span className="rounded-full bg-white px-3 py-1 font-medium text-muted ring-1 ring-brand-100">
          ⏱ {recipe.cookMinutes} phút
        </span>
      </div>
      <h1 className="mt-3 text-3xl leading-tight font-extrabold tracking-tight text-ink sm:text-4xl">{recipe.name}</h1>
      {recipe.description && <p className="mt-2 text-lg leading-relaxed text-muted">{recipe.description}</p>}

      {/* Bảng dinh dưỡng */}
      <section className="mt-8" aria-labelledby="dinh-duong">
        <div className="flex items-baseline justify-between gap-2">
          <h2 id="dinh-duong" className="text-xl font-bold text-ink">
            Dinh dưỡng
          </h2>
          <p className="text-sm text-muted">1 khẩu phần ({recipe.servingGrams} g)</p>
        </div>
        <table className="mt-3 w-full overflow-hidden rounded-2xl bg-white text-left ring-1 ring-brand-100">
          <tbody>
            {nutrition.map((n, i) => (
              <tr key={n.label} className={i % 2 ? "bg-canvas" : ""}>
                <th scope="row" className="px-4 py-3.5 font-normal text-muted">
                  {n.label}
                </th>
                <td className={`px-4 py-3.5 text-right font-bold ${i === 0 ? "text-accent-500" : "text-ink"}`}>
                  {n.value}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      {/* Nguyên liệu */}
      <section className="mt-8" aria-labelledby="nguyen-lieu">
        <h2 id="nguyen-lieu" className="text-xl font-bold text-ink">
          Nguyên liệu
        </h2>
        <ul className="mt-3 divide-y divide-brand-100 overflow-hidden rounded-2xl bg-white ring-1 ring-brand-100">
          {recipe.ingredients?.map((ing) => (
            <li key={ing._key} className="flex items-center justify-between gap-4 px-4 py-3.5">
              <span className="flex items-center gap-2 text-ink">
                <span aria-hidden className="h-2 w-2 rounded-full bg-brand-400" />
                {ing.name}
              </span>
              <span className="shrink-0 font-medium text-muted">{ing.grams} g</span>
            </li>
          ))}
        </ul>
      </section>

      {/* Các bước nấu */}
      <section className="mt-8" aria-labelledby="cach-nau">
        <h2 id="cach-nau" className="text-xl font-bold text-ink">
          Các bước nấu
        </h2>
        <ol className="mt-3 space-y-3">
          {recipe.steps?.map((step, i) => (
            <li key={i} className="flex gap-3 rounded-2xl bg-white p-4 ring-1 ring-brand-100">
              <span
                aria-hidden
                className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-brand-600 text-sm font-bold text-white"
              >
                {i + 1}
              </span>
              <p className="pt-1 leading-relaxed text-ink">{step}</p>
            </li>
          ))}
        </ol>
      </section>

      <div className="mt-10 rounded-3xl bg-brand-50 p-5 text-center">
        <p className="font-semibold text-brand-900">Muốn biết nên ăn bao nhiêu cho vừa calo?</p>
        <ButtonLink href="/tao-thuc-don" className="mt-3 w-full sm:w-auto">
          Tạo thực đơn miễn phí
        </ButtonLink>
      </div>
    </main>
  );
}
