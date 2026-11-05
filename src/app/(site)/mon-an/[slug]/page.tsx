import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { RecipeImage } from "@/components/RecipeImage";
import { Icon, Icons } from "@/components/icons";
import { ButtonLink, Notice } from "@/components/ui";
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
  const eatOut = recipe.kind === "eatout";

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
        className="inline-flex min-h-11 items-center gap-1 rounded-lg px-1 text-sm font-semibold text-brand-700 hover:underline"
      >
        ← Tất cả món
      </Link>

      <div className="animate-enter mt-2 overflow-hidden rounded-3xl border border-line shadow-soft">
        <RecipeImage
          image={recipe.image}
          name={recipe.name}
          width={1200}
          sizes="(min-width: 768px) 768px, 100vw"
          preload
        />
      </div>
      {recipe.image?.credit && (
        <p className="mt-1 text-xs text-muted">
          Ảnh: {recipe.image.credit}
          {recipe.image.license && ` · ${recipe.image.license}`}
          {recipe.image.sourceUrl && (
            <>
              {" · "}
              <a
                href={recipe.image.sourceUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex min-h-11 items-center underline hover:text-brand-700"
              >
                Nguồn ảnh
              </a>
            </>
          )}
        </p>
      )}

      <div className="mt-5 flex flex-wrap items-center gap-2 text-sm">
        {recipe.meals?.map((m) => (
          <span key={m} className="rounded-lg bg-brand-50 px-2.5 py-1 font-semibold text-brand-700">
            {mealLabel(m)}
          </span>
        ))}
        {eatOut ? (
          <span className="inline-flex items-center gap-1 rounded-lg bg-aqua-800 px-2.5 py-1 font-semibold text-white">
            <Icon icon={Icons.eatOut} size={16} />
            Ăn ngoài / mua sẵn
          </span>
        ) : (
          <span className="inline-flex items-center gap-1 rounded-lg border border-line bg-white px-2.5 py-1 font-medium text-muted">
            <Icon icon={Icons.time} size={16} />
            {recipe.cookMinutes} phút
          </span>
        )}
      </div>
      <h1 className="mt-3 text-[2.25rem] leading-tight font-bold tracking-tight text-ink">{recipe.name}</h1>
      {recipe.description && <p className="mt-2 text-lg leading-relaxed text-muted">{recipe.description}</p>}

      {/* Bảng dinh dưỡng */}
      <section className="mt-8" aria-labelledby="dinh-duong">
        <div className="flex items-baseline justify-between gap-2">
          <h2 id="dinh-duong" className="text-xl font-bold text-ink">
            Dinh dưỡng
          </h2>
          <p className="text-sm text-muted">
            {eatOut ? recipe.servingNote ?? "1 phần thường bán" : `1 khẩu phần (${recipe.servingGrams} g)`}
          </p>
        </div>
        <table className="mt-3 w-full overflow-hidden rounded-2xl border border-line bg-white text-left">
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
        {eatOut && (
          <p className="mt-2 text-sm text-muted">
            Calo ước tính cho 1 phần thường bán, có thể khác tuỳ quán và cách chế biến.
          </p>
        )}
      </section>

      {/* Món ăn ngoài: mẹo gọi món + nơi bán (không có công thức) */}
      {eatOut && (
        <section className="mt-8 space-y-3" aria-labelledby="meo-goi-mon">
          <h2 id="meo-goi-mon" className="text-xl font-bold text-ink">
            Ăn ngoài sao cho lành mạnh
          </h2>
          {recipe.healthyTip && (
            <Notice tone="info" title="Mẹo gọi món">
              {recipe.healthyTip}
            </Notice>
          )}
          {recipe.whereToBuy && (
            <p className="inline-flex items-center gap-2 text-muted">
              <Icon icon={Icons.eatOut} size={18} />
              Thường bán ở: <span className="font-semibold text-ink">{recipe.whereToBuy}</span>
            </p>
          )}
        </section>
      )}

      {!eatOut && (
        <>
      {/* Nguyên liệu */}
      <section className="mt-8" aria-labelledby="nguyen-lieu">
        <h2 id="nguyen-lieu" className="text-xl font-bold text-ink">
          Nguyên liệu
        </h2>
        <ul className="mt-3 divide-y divide-line overflow-hidden rounded-2xl border border-line bg-white">
          {recipe.ingredients?.map((ing) => (
            <li key={ing._key} className="flex items-center justify-between gap-4 px-4 py-3.5">
              <span className="flex items-center gap-2 text-ink">
                <span aria-hidden className="h-1.5 w-1.5 rounded-full bg-brand-400" />
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
            <li key={i} className="flex gap-3 rounded-2xl border border-line bg-white p-4">
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
        </>
      )}

      <div className="mt-10 rounded-3xl bg-aqua-50 p-6 text-center">
        <p className="font-semibold text-brand-900">Muốn biết nên ăn bao nhiêu cho vừa calo?</p>
        <ButtonLink href="/tao-thuc-don" className="mt-3 w-full sm:w-auto">
          Tạo thực đơn miễn phí
        </ButtonLink>
      </div>
    </main>
  );
}
