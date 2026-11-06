import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { Suspense } from "react";

import { Icons } from "@/components/icons";
import { ButtonLink, Notice, PageHeader } from "@/components/ui";
import { isValidIsoDate, todayInVietnam } from "@/lib/diary";
import { getCustomFoods, getDiaryDay } from "@/lib/diary-db";
import { getHealthData } from "@/lib/health-db";
import { calcTargetCalories, parseUserInput } from "@/lib/meal-plan";
import { getProfile } from "@/lib/profile";
import { createSupabaseServer, getAuthUser } from "@/lib/supabase/server";
import { DEFAULT_WEIGHT_KG } from "@/lib/workout-plan";
import { getPlannerRecipes } from "@/sanity/lib/recipes";

import { DiaryShell } from "./DiaryShell";
import { FoodTab } from "./FoodTab";
import { HealthTab } from "./HealthTab";
import DiaryLoading from "./loading";
import { WorkoutTab } from "./WorkoutTab";

export const metadata: Metadata = { title: "Nhật ký – Glow up with me", robots: { index: false } };

export default function DiaryPage({ searchParams }: PageProps<"/nhat-ky">) {
  return (
    <Suspense fallback={<DiaryLoading />}>
      <DiaryContent searchParams={searchParams} />
    </Suspense>
  );
}

const first = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v);

async function DiaryContent({ searchParams }: { searchParams: PageProps<"/nhat-ky">["searchParams"] }) {
  const sp = await searchParams;
  const supabase = await createSupabaseServer();
  const user = supabase ? await getAuthUser(supabase) : null;
  if (!supabase || !user) redirect("/dang-nhap?next=/nhat-ky");

  // Chỉ gọi new Date() sau khi đã đọc dữ liệu động ở trên
  const today = todayInVietnam();
  const rawDate = first(sp.ngay);
  const date = isValidIsoDate(rawDate) ? rawDate : today;
  const rawTab = first(sp.tab);
  const tab = rawTab === "tap" ? "tap" : rawTab === "suc-khoe" ? "suc-khoe" : "an";

  const [day, profile, recipes, health, customFoods] = await Promise.all([
    getDiaryDay(supabase, user.id, date),
    getProfile(supabase, user.id),
    getPlannerRecipes(),
    getHealthData(supabase, user.id, date),
    getCustomFoods(supabase, user.id),
  ]);

  const foods = day.foods ?? [];
  const workouts = day.workouts ?? [];
  const eaten = day.foods === null ? null : Math.round(foods.reduce((s, f) => s + f.calories, 0));
  // Chỉ tính buổi tập đã ghi. Năng lượng hoạt động của Apple (gồm cả đi lại thường ngày) KHÔNG cộng vào đây vì calo mục tiêu đã có hệ số vận động.
  const burned = day.workouts === null ? null : Math.round(workouts.reduce((s, w) => s + w.calories, 0));

  const input = profile
    ? parseUserInput({
        gender: profile.gender,
        age: profile.age,
        heightCm: profile.height_cm,
        weightKg: profile.weight_kg,
        activity: profile.activity,
        goal: profile.goal,
      })
    : null;
  const target = input ? calcTargetCalories(input) : null;
  const weightKg = profile?.weight_kg ?? DEFAULT_WEIGHT_KG;
  const usingDefaultWeight = profile?.weight_kg == null;

  const retryHref = (t: string) => {
    const q = new URLSearchParams();
    if (date !== today) q.set("ngay", date);
    if (t !== "an") q.set("tab", t);
    const qs = q.toString();
    return qs ? `/nhat-ky?${qs}` : "/nhat-ky";
  };

  const remaining = target != null && eaten != null && burned != null ? target + burned - eaten : null;
  const recipeList = recipes.map((r) => ({ slug: r.slug, name: r.name, calories: r.calories, meals: r.meals, kind: r.kind }));

  const loadError = (t: "an" | "tap" | "suc-khoe") => (
    <Notice
      tone="error"
      title="Chưa tải được nhật ký"
      action={
        <ButtonLink href={retryHref(t)} variant="secondary">
          Thử tải lại
        </ButtonLink>
      }
    >
      Có thể mạng đang chậm. Bạn đợi một chút rồi thử lại nhé.
    </Notice>
  );

  // Cả 3 tab được dựng sẵn để đổi tab tức thì (xem DiaryShell)
  const panels = {
    an: day.foods === null ? loadError("an") : <FoodTab key={date} date={date} foods={foods} recipes={recipeList} customFoods={customFoods} />,
    tap:
      day.workouts === null ? (
        loadError("tap")
      ) : (
        <WorkoutTab key={date} date={date} plan={day.plan} workouts={workouts} weightKg={weightKg} usingDefaultWeight={usingDefaultWeight} isToday={date === today} />
      ),
    "suc-khoe": health === null ? loadError("suc-khoe") : <HealthTab key={date} date={date} today={today} week={health.week} cycles={health.cycles} />,
  };

  const between = (
    <>
      {/* Tổng trong ngày */}
      <section aria-label="Tổng calo trong ngày" className="animate-enter rounded-3xl bg-brand-600 p-5 text-white">
        {remaining != null ? (
          <>
            <p className="text-sm font-semibold text-brand-50">{remaining >= 0 ? "Còn lại hôm nay" : "Đã vượt mục tiêu"}</p>
            <p className="mt-1 text-4xl font-bold">
              {Math.abs(remaining)} <span className="text-base font-medium text-brand-50">kcal</span>
            </p>
          </>
        ) : (
          <p className="text-sm font-semibold text-brand-50">Tổng trong ngày</p>
        )}
        <dl className="mt-4 grid grid-cols-3 gap-2 text-center">
          {[
            { label: "Đã ăn", value: eaten },
            { label: "Đốt thêm", value: burned },
            { label: "Mục tiêu", value: target },
          ].map((n) => (
            <div key={n.label} className="rounded-2xl bg-white/15 p-3">
              <dt className="text-xs text-brand-50">{n.label}</dt>
              <dd className="font-bold">{n.value == null ? "—" : `${n.value} kcal`}</dd>
            </div>
          ))}
        </dl>
        {remaining != null && (
          <p className="mt-3 text-xs text-brand-50">Còn lại = mục tiêu + calo đốt thêm khi tập − calo đã ăn (ước tính).</p>
        )}
      </section>

      {target == null && (
        <Notice
          tone="info"
          icon={Icons.target}
          title="Điền hồ sơ để biết calo mục tiêu"
          action={
            <ButtonLink href="/ho-so" variant="secondary">
              Mở hồ sơ
            </ButtonLink>
          }
        >
          Có giới tính, tuổi, chiều cao, cân nặng và mức vận động, web sẽ tính sẵn lượng calo bạn cần mỗi ngày.
        </Notice>
      )}
    </>
  );

  return (
    <main className="mx-auto w-full max-w-2xl space-y-5 px-4 py-8 sm:py-12">
      <PageHeader eyebrow="Nhật ký" title="Nhật ký ăn tập">
        Hôm nay bạn ăn gì, tập gì?
      </PageHeader>
      <DiaryShell date={date} today={today} initialTab={tab} between={between} panels={panels} />
    </main>
  );
}
