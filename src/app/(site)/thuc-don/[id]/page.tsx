import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";

import { MealEntryCard } from "@/components/MealEntryCard";
import { ButtonLink, LoadingLabel, Notice, Skeleton } from "@/components/ui";
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
    <main className="mx-auto w-full max-w-2xl px-4 py-8 sm:py-12">
      <Suspense fallback={<MealPlanSkeleton />}>
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
      <Notice
        tone="error"
        title="Chưa tải được thực đơn"
        action={
          <ButtonLink href={`/thuc-don/${id}`} variant="secondary">
            Thử tải lại
          </ButtonLink>
        }
      >
        Có thể mạng đang chậm hoặc hệ thống đang bảo trì. Thực đơn của bạn vẫn được lưu an toàn, vui lòng thử lại
        sau ít phút.
      </Notice>
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
      <p className="text-sm font-semibold text-brand-600">✅ Đã lưu thực đơn</p>
      <h1 className="mt-1 text-3xl font-extrabold tracking-tight text-ink sm:text-4xl">Thực đơn của bạn</h1>
      <p className="mt-1 text-sm text-muted">Tạo lúc {createdAt}</p>

      <div className="mt-4 rounded-3xl bg-white p-5 ring-1 ring-brand-100">
        <p className="text-sm text-muted">{describeUser(plan.user_input)}</p>
        <p className="mt-1 text-lg font-bold text-ink">
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
                className="mt-3 inline-flex min-h-11 items-center text-sm font-semibold text-brand-700 hover:underline"
              >
                Xem cách nấu →
              </Link>
            )}
          </MealEntryCard>
        ))}

        <NutritionTotals totals={totals} target={plan.target_calories} />

        {plan.selected_foods.length > 0 && (
          <section>
            <h2 className="text-sm font-bold text-ink">🧺 Thực phẩm đã chọn</h2>
            <ul className="mt-2 flex flex-wrap gap-2">
              {plan.selected_foods.map((f) => (
                <li
                  key={f}
                  className="rounded-full bg-white px-3 py-1.5 text-sm text-ink ring-1 ring-brand-100"
                >
                  {f}
                </li>
              ))}
            </ul>
          </section>
        )}
      </div>

      <div className="mt-8 rounded-3xl bg-brand-50 p-5">
        <p className="font-semibold text-brand-900">Gửi thực đơn cho người thân hoặc lưu lại để xem sau</p>
        <div className="mt-3 flex flex-col gap-3 sm:flex-row sm:items-start">
          <CopyLinkButton />
          <ButtonLink href="/tao-thuc-don" variant="secondary">
            Tạo thực đơn mới
          </ButtonLink>
        </div>
      </div>
    </>
  );
}

// Khung "đang tải" khi mở trang thực đơn
function MealPlanSkeleton() {
  return (
    <div className="space-y-4">
      <LoadingLabel>Đang tải thực đơn…</LoadingLabel>
      <Skeleton className="h-9 w-2/3" />
      <Skeleton className="h-20 w-full rounded-3xl" />
      {[0, 1, 2].map((i) => (
        <Skeleton key={i} className="h-36 w-full rounded-3xl" />
      ))}
    </div>
  );
}
