import type { Metadata } from "next";

import { ButtonLink, Notice, PageHeader } from "@/components/ui";
import { getPlannerRecipes } from "@/sanity/lib/recipes";

import { Planner } from "./Planner";

export const metadata: Metadata = {
  title: "Tạo thực đơn – My Fridge",
  description: "Nhập thông tin, chọn thực phẩm đang có và nhận thực đơn sáng, trưa, tối vừa đủ calo.",
};

export default async function CreatePlanPage() {
  const recipes = await getPlannerRecipes();

  return (
    <main className="mx-auto w-full max-w-2xl px-4 pt-8 sm:pt-12">
      <PageHeader eyebrow="Miễn phí · khoảng 1 phút" title="Tạo thực đơn">
        Trả lời vài câu hỏi ngắn, My Fridge sẽ gợi ý thực đơn cả ngày cho bạn.
      </PageHeader>
      <div className="mt-6">
        {recipes.length > 0 ? (
          <Planner recipes={recipes} />
        ) : (
          <Notice
            tone="error"
            title="Chưa tải được danh sách món ăn"
            action={
              <ButtonLink href="/tao-thuc-don" variant="secondary">
                Thử tải lại
              </ButtonLink>
            }
          >
            Có thể mạng đang chậm hoặc hệ thống đang bảo trì. Bạn vui lòng thử lại sau ít phút nhé.
          </Notice>
        )}
      </div>
    </main>
  );
}
