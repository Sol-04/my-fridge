import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { Suspense } from "react";

import { buttonClass } from "@/components/ui";
import { displayNameOf, getProfile, initialOf } from "@/lib/profile";
import { createSupabaseServer } from "@/lib/supabase/server";

import { signOut } from "../(auth)/actions";
import { NewPasswordForm } from "../(auth)/dat-lai-mat-khau/NewPasswordForm";
import { ProfileForm } from "./ProfileForm";
import { SavedPlansList, type SavedPlanRow } from "./SavedPlansList";
import ProfileLoading from "./loading";

export const metadata: Metadata = { title: "Hồ sơ của bạn – My Fridge", robots: { index: false } };

export default function ProfilePage() {
  return (
    <Suspense fallback={<ProfileLoading />}>
      <ProfileContent />
    </Suspense>
  );
}

function Section({ id, title, icon, children }: { id: string; title: string; icon: string; children: React.ReactNode }) {
  return (
    <section aria-labelledby={id} className="rounded-3xl bg-white p-5 shadow-sm ring-1 ring-brand-100 sm:p-6">
      <h2 id={id} className="flex items-center gap-2 text-xl font-bold text-ink">
        <span aria-hidden>{icon}</span>
        {title}
      </h2>
      <div className="mt-4">{children}</div>
    </section>
  );
}

async function ProfileContent() {
  const supabase = await createSupabaseServer();
  const { data } = supabase ? await supabase.auth.getUser().catch(() => ({ data: { user: null } })) : { data: { user: null } };
  const user = data.user;
  if (!supabase || !user) redirect("/dang-nhap?next=/ho-so");

  const [profile, plansRes] = await Promise.all([
    getProfile(supabase, user.id),
    supabase
      .from("meal_plans")
      .select("id, created_at, target_calories, breakfast, lunch, dinner")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(20)
      .then(
        (r) => r,
        () => ({ data: null, error: { message: "network" } }),
      ),
  ]);
  if (plansRes.error) console.error("Không đọc được thực đơn đã lưu:", plansRes.error.message);
  const plans = plansRes.error ? null : ((plansRes.data ?? []) as SavedPlanRow[]);

  const name = displayNameOf(profile, user.email);

  return (
    <main className="mx-auto w-full max-w-2xl space-y-5 px-4 py-8 sm:py-12">
      <header className="flex items-center gap-4">
        <span
          aria-hidden
          className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-brand-600 text-2xl font-extrabold text-white"
        >
          {initialOf(name)}
        </span>
        <div className="min-w-0">
          <p className="text-sm font-semibold text-brand-600">Hồ sơ của bạn</p>
          <h1 className="truncate text-2xl font-extrabold tracking-tight text-ink sm:text-3xl">Xin chào, {name}!</h1>
          <p className="truncate text-sm text-muted">{user.email}</p>
        </div>
      </header>

      <Section id="thong-tin" title="Thông tin cơ thể" icon="🧍">
        <p className="-mt-2 mb-4 text-sm text-muted">Dùng để tính calo và tự điền khi bạn tạo thực đơn.</p>
        <ProfileForm
          initial={{
            displayName: name,
            gender: profile?.gender ?? "female",
            age: profile?.age?.toString() ?? "",
            heightCm: profile?.height_cm?.toString() ?? "",
            weightKg: profile?.weight_kg?.toString() ?? "",
            activity: profile?.activity ?? "light",
            goal: profile?.goal ?? "lose",
          }}
        />
      </Section>

      <Section id="thuc-don-da-luu" title="Thực đơn đã lưu" icon="📋">
        <SavedPlansList plans={plans} />
      </Section>

      <Section id="tai-khoan" title="Tài khoản" icon="⚙️">
        <h3 className="font-semibold text-ink">Đổi mật khẩu</h3>
        <div className="mt-3">
          <NewPasswordForm submitText="Đổi mật khẩu" />
        </div>
        <div className="mt-6 border-t border-brand-100 pt-5">
          <form action={signOut}>
            <button type="submit" className={buttonClass("secondary", "md", "w-full sm:w-auto")}>
              🚪 Đăng xuất
            </button>
          </form>
        </div>
      </Section>
    </main>
  );
}
