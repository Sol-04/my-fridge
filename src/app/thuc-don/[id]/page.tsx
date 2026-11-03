import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";

import { MealEntryCard } from "@/components/MealEntryCard";
import { NutritionTotals } from "@/components/NutritionTotals";
import { describeUser, MEAL_ORDER, mealTargets, sumMeals } from "@/lib/meal-plan";
import { getMealPlan } from "@/lib/meal-plans-db";
import { mealLabel } from "@/sanity/meals";

import { CopyLinkButton } from "./CopyLinkButton";

// Thực đơn chứa thông tin cá nhân → không cho Google lưu trang.
export const metadata: Metadata = {
  title: "Thực đơn của bạn – My Fridge",
  robots: { index: false, follow: false },
};

export default function MealPlanPage({ params }: PageProps<"/thuc-don/[id]">) {
  return (
    <main className="mx-auto w-full max-w-2xl px-4 py-6 sm:py-10">
      <Suspense fallback={<p className="py-10 text-center text-zinc-500">Đang tải thực đơn…</p>}>
        <MealPlanContent params={params} />
      </Suspense>
    </main>
  );
}

async function MealPlanContent({ params }: { params: PageProps<"/thuc-don/[id]">["params"] }) {
  const { id } = await params;
  const result = await getMealPlan(id);

  if (result.status === "not-found") notFound();
  if (result.status === "error") {
    return (
      <div className="rounded-xl bg-amber-50 p-4 text-amber-800">
        <p className="font-semibold">Chưa tải được thực đơn.</p>
        <p className="mt-1 text-sm">Vui lòng thử lại sau ít phút.</p>
      </div>
    );
  }

  const plan = result.plan;
  const targets = mealTargets(plan.target_calories);
  const totals = sumMeals([plan.breakfast, plan.lunch, plan.dinner]);
  const createdAt = new Date(plan.created_at).toLocaleString("vi-VN", {
    dateStyle: "long",
    timeStyle: "short",
    timeZone: "Asia/Ho_Chi_Minh",
  });

  return (
    <>
      <Link href="/" className="inline-flex min-h-11 items-center text-sm text-emerald-700 hover:underline">
        ← Trang chủ
      </Link>
      <h1 className="mt-1 text-3xl font-bold tracking-tight text-zinc-900 sm:text-4xl dark:text-zinc-100">
        Thực đơn của bạn
      </h1>
      <p className="mt-1 text-sm text-zinc-500">Tạo lúc {createdAt}</p>

      <div className="mt-4 rounded-2xl border border-zinc-200 p-4 dark:border-zinc-800">
        <p className="text-sm text-zinc-600 dark:text-zinc-400">{describeUser(plan.user_input)}</p>
        <p className="mt-1 text-lg font-semibold text-zinc-900 dark:text-zinc-100">
          Mục tiêu: {plan.target_calories} kcal/ngày
        </p>
      </div>

      <div className="mt-4 space-y-4">
        {MEAL_ORDER.map((meal) => (
          <MealEntryCard
            key={meal}
            meal={meal}
            title={mealLabel(meal)}
            target={targets[meal]}
            entry={plan[meal]}
            emptyText="Không có món cho bữa này."
          >
            {plan[meal] && (
              <Link
                href={`/mon-an/${plan[meal]!.slug}`}
                className="mt-3 inline-flex min-h-11 items-center text-sm font-medium text-emerald-700 hover:underline"
              >
                Xem cách nấu →
              </Link>
            )}
          </MealEntryCard>
        ))}

        <NutritionTotals totals={totals} target={plan.target_calories} />

        {plan.selected_foods.length > 0 && (
          <section>
            <h2 className="text-sm font-semibold text-zinc-800 dark:text-zinc-200">Thực phẩm đã chọn</h2>
            <ul className="mt-2 flex flex-wrap gap-2">
              {plan.selected_foods.map((f) => (
                <li
                  key={f}
                  className="rounded-full bg-zinc-100 px-3 py-1 text-sm text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300"
                >
                  {f}
                </li>
              ))}
            </ul>
          </section>
        )}
      </div>

      <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-start">
        <CopyLinkButton />
        <Link
          href="/tao-thuc-don"
          className="inline-flex min-h-12 items-center justify-center rounded-full border border-zinc-300 px-6 font-medium text-zinc-700 hover:border-emerald-600 hover:text-emerald-700 dark:border-zinc-700 dark:text-zinc-200"
        >
          Tạo thực đơn mới
        </Link>
      </div>
    </>
  );
}
