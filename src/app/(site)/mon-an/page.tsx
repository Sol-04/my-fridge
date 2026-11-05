import type { Metadata } from "next";

import { ButtonLink, Notice, PageHeader } from "@/components/ui";
import { getRecipes } from "@/sanity/lib/recipes";

import { RecipeList } from "./RecipeList";

export const metadata: Metadata = {
  title: "Món ăn – Glow up with me",
  description: "Các món ăn Việt lành mạnh, dễ nấu cho bữa sáng, trưa, tối kèm lượng calo.",
};

export default async function RecipesPage() {
  const recipes = await getRecipes();

  return (
    <main className="mx-auto w-full max-w-5xl px-4 py-8 sm:py-12">
      <PageHeader eyebrow="Thư viện món" title="Món ăn">
        Món Việt lành mạnh, dễ nấu. Chọn bữa để lọc nhanh.
      </PageHeader>

      <div className="mt-6">
        {recipes.length > 0 ? (
          <RecipeList recipes={recipes} />
        ) : (
          <Notice
            tone="error"
            title="Chưa tải được danh sách món ăn"
            action={
              <ButtonLink href="/mon-an" variant="secondary">
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
