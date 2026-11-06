import type { Metadata } from "next";
import { Suspense } from "react";

import { ButtonLink, Notice, PageHeader } from "@/components/ui";
import { parseUserInput, type UserInput } from "@/lib/meal-plan";
import { getProfile } from "@/lib/profile";
import { createSupabaseServer, getAuthUser } from "@/lib/supabase/server";
import { getPlannerRecipes } from "@/sanity/lib/recipes";

import PlannerLoading from "./loading";
import { Planner } from "./Planner";

export const metadata: Metadata = {
  title: "Tạo thực đơn – Glow up with me",
  description: "Nhập thông tin, chọn thực phẩm đang có và nhận thực đơn sáng, trưa, tối vừa đủ calo.",
};

export default function CreatePlanPage() {
  return (
    <Suspense fallback={<PlannerLoading />}>
      <CreatePlanContent />
    </Suspense>
  );
}

async function CreatePlanContent() {
  const recipes = await getPlannerRecipes();

  // Người dùng đang đăng nhập + hồ sơ (để tự điền bước 1)
  const supabase = await createSupabaseServer();
  const user = supabase ? await getAuthUser(supabase) : null;
  const profile = supabase && user ? await getProfile(supabase, user.id) : null;
  const profileInput: UserInput | null = profile
    ? parseUserInput({
        gender: profile.gender,
        age: profile.age,
        heightCm: profile.height_cm,
        weightKg: profile.weight_kg,
        activity: profile.activity,
        goal: profile.goal,
      })
    : null;

  return (
    <main className="mx-auto w-full max-w-2xl px-4 pt-8 sm:pt-12">
      <PageHeader eyebrow="Miễn phí · khoảng 1 phút" title="Tạo thực đơn">
        Trả lời vài câu hỏi ngắn, Glow up with me sẽ gợi ý thực đơn cả ngày cho bạn.
      </PageHeader>
      <div className="mt-6">
        {recipes.length > 0 ? (
          <Planner recipes={recipes} isLoggedIn={!!user} profileInput={profileInput} />
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
