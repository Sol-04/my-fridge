import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Suspense } from "react";

import { Icon, Icons } from "@/components/icons";
import { ButtonLink, buttonClass, Notice, PageHeader } from "@/components/ui";
import { addDays, formatDiaryDate, isValidIsoDate, todayInVietnam } from "@/lib/diary";
import { getDiaryDay } from "@/lib/diary-db";
import { getHealthData } from "@/lib/health-db";
import { calcTargetCalories, parseUserInput } from "@/lib/meal-plan";
import { getProfile } from "@/lib/profile";
import { createSupabaseServer } from "@/lib/supabase/server";
import { DEFAULT_WEIGHT_KG } from "@/lib/workout-plan";
import { getPlannerRecipes } from "@/sanity/lib/recipes";

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
  const { data } = supabase ? await supabase.auth.getUser().catch(() => ({ data: { user: null } })) : { data: { user: null } };
  const user = data.user;
  if (!supabase || !user) redirect("/dang-nhap?next=/nhat-ky");

  // Chỉ gọi new Date() sau khi đã đọc dữ liệu động ở trên
  const today = todayInVietnam();
  const rawDate = first(sp.ngay);
  const date = isValidIsoDate(rawDate) ? rawDate : today;
  const rawTab = first(sp.tab);
  const tab = rawTab === "tap" ? "tap" : rawTab === "suc-khoe" ? "suc-khoe" : "an";

  const [day, profile, recipes, health] = await Promise.all([
    getDiaryDay(supabase, user.id, date),
    getProfile(supabase, user.id),
    getPlannerRecipes(),
    getHealthData(supabase, user.id, date),
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

  const href = (d: string, t: string) => {
    const q = new URLSearchParams();
    if (d !== today) q.set("ngay", d);
    if (t !== "an") q.set("tab", t);
    const s = q.toString();
    return s ? `/nhat-ky?${s}` : "/nhat-ky";
  };
  const navBtn = "inline-flex min-h-11 min-w-11 shrink-0 items-center justify-center rounded-2xl border-[1.5px] border-line bg-white text-brand-700 transition duration-200 hover:border-brand-300 hover:bg-brand-50 active:translate-y-px";

  const remaining = target != null && eaten != null && burned != null ? target + burned - eaten : null;
  const loadError = tab === "tap" ? day.workouts === null : tab === "suc-khoe" ? health === null : day.foods === null;
  const recipeList = recipes.map((r) => ({ slug: r.slug, name: r.name, calories: r.calories, meals: r.meals, kind: r.kind }));

  return (
    <main className="mx-auto w-full max-w-2xl space-y-5 px-4 py-8 sm:py-12">
      <PageHeader eyebrow="Nhật ký" title="Nhật ký ăn tập">
        Hôm nay bạn ăn gì, tập gì?
      </PageHeader>

      {/* Đổi ngày */}
      <nav aria-label="Chọn ngày" className="animate-enter flex items-center gap-2">
        <Link href={href(addDays(date, -1), tab)} className={navBtn} aria-label="Ngày trước">
          <Icon icon={Icons.prevDay} size={20} />
        </Link>
        <p className="min-w-0 flex-1 text-center text-base font-bold text-ink" aria-live="polite">
          {formatDiaryDate(date)}
        </p>
        <Link href={href(addDays(date, 1), tab)} className={navBtn} aria-label="Ngày sau">
          <Icon icon={Icons.nextDay} size={20} />
        </Link>
        {date !== today && (
          <Link href={href(today, tab)} className={buttonClass("secondary", "md", "min-h-11 shrink-0 px-3 text-sm")}>
            Hôm nay
          </Link>
        )}
      </nav>

      {/* Hai tab */}
      <nav aria-label="Phần nhật ký" className="animate-enter grid grid-cols-3 gap-2 rounded-2xl border border-line bg-white p-1.5">
        {[
          { key: "an", label: "Ăn uống", icon: Icons.allMeals },
          { key: "tap", label: "Tập luyện", icon: Icons.workout },
          { key: "suc-khoe", label: "Sức khoẻ", icon: Icons.heartbeat },
        ].map((t) => (
          <Link
            key={t.key}
            href={href(date, t.key)}
            aria-current={tab === t.key ? "page" : undefined}
            className={`inline-flex min-h-11 items-center justify-center gap-2 rounded-xl text-sm font-semibold transition duration-200 ${
              tab === t.key ? "bg-brand-600 text-white" : "text-muted hover:bg-brand-50 hover:text-brand-700"
            }`}
          >
            <Icon icon={t.icon} size={18} />
            {t.label}
          </Link>
        ))}
      </nav>

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
          <p className="mt-3 text-xs text-brand-50">
            Còn lại = mục tiêu + calo đốt thêm khi tập − calo đã ăn (ước tính).
          </p>
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

      {loadError ? (
        <Notice
          tone="error"
          title="Chưa tải được nhật ký"
          action={
            <ButtonLink href={href(date, tab)} variant="secondary">
              Thử tải lại
            </ButtonLink>
          }
        >
          Có thể mạng đang chậm. Bạn đợi một chút rồi thử lại nhé.
        </Notice>
      ) : tab === "suc-khoe" && health ? (
        <HealthTab key={date} date={date} today={today} week={health.week} cycles={health.cycles} />
      ) : tab === "tap" ? (
        <WorkoutTab key={date} date={date} plan={day.plan} workouts={workouts} weightKg={weightKg} usingDefaultWeight={usingDefaultWeight} isToday={date === today} />
      ) : (
        <FoodTab key={date} date={date} foods={foods} recipes={recipeList} />
      )}
    </main>
  );
}
