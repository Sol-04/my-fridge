import type { Metadata } from "next";
import Link from "next/link";

import { getPlannerRecipes } from "@/sanity/lib/recipes";

import { Planner } from "./Planner";

export const metadata: Metadata = {
  title: "Tạo thực đơn – My Fridge",
  description: "Nhập thông tin, chọn thực phẩm đang có và nhận thực đơn sáng, trưa, tối vừa đủ calo.",
};

export default async function CreatePlanPage() {
  const recipes = await getPlannerRecipes();

  return (
    <main className="mx-auto w-full max-w-2xl px-4 pt-6 sm:pt-10">
      <Link href="/" className="inline-flex min-h-11 items-center text-sm text-emerald-700 hover:underline">
        ← Trang chủ
      </Link>
      <h1 className="mt-1 text-3xl font-bold tracking-tight text-zinc-900 sm:text-4xl dark:text-zinc-100">
        Tạo thực đơn
      </h1>
      <div className="mt-6">
        {recipes.length > 0 ? (
          <Planner recipes={recipes} />
        ) : (
          <p className="rounded-xl bg-amber-50 p-4 text-amber-800">
            Chưa tải được danh sách món ăn. Vui lòng thử lại sau.
          </p>
        )}
      </div>
    </main>
  );
}
