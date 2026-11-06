import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { Suspense } from "react";

import { Icon, Icons, type LucideIcon } from "@/components/icons";
import { buttonClass, cardClass } from "@/components/ui";
import { displayNameOf, getProfile, initialOf } from "@/lib/profile";
import { createSupabaseServer, getAuthUser } from "@/lib/supabase/server";

import { signOut } from "../(auth)/actions";
import { NewPasswordForm } from "../(auth)/dat-lai-mat-khau/NewPasswordForm";
import { LarkSettings } from "./LarkSettings";
import { ProfileForm } from "./ProfileForm";
import { SavedPlansList, type SavedPlanRow } from "./SavedPlansList";
import ProfileLoading from "./loading";

export const metadata: Metadata = { title: "Hồ sơ của bạn – Glow up with me", robots: { index: false } };

export default function ProfilePage() {
  return (
    <Suspense fallback={<ProfileLoading />}>
      <ProfileContent />
    </Suspense>
  );
}

function Section({ id, title, icon, children }: { id: string; title: string; icon: LucideIcon; children: React.ReactNode }) {
  return (
    <section aria-labelledby={id} className={`animate-enter p-5 sm:p-6 ${cardClass}`}>
      <h2 id={id} className="flex items-center gap-2.5 text-xl font-bold text-ink">
        <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-aqua-50 text-aqua-800">
          <Icon icon={icon} size={20} />
        </span>
        {title}
      </h2>
      <div className="mt-4">{children}</div>
    </section>
  );
}

async function ProfileContent() {
  const supabase = await createSupabaseServer();
  const user = supabase ? await getAuthUser(supabase) : null;
  if (!supabase || !user) redirect("/dang-nhap?next=/ho-so");

  const [profile, larkRes, plansRes] = await Promise.all([
    getProfile(supabase, user.id),
    // Chỉ lấy các công tắc, KHÔNG lấy link webhook (bí mật) để nó không rời khỏi máy chủ
    supabase
      .from("lark_settings")
      .select("enabled, water_on, move_on, meal_on, calorie_on")
      .eq("user_id", user.id)
      .maybeSingle()
      .then(
        (r) => r,
        () => ({ data: null, error: { message: "network" } }),
      ),
    supabase
      .from("meal_plans")
      // Chỉ lấy tên món + tổng calo của từng bữa (không kéo cả cột jsonb lớn) để trang Hồ sơ mở nhanh hơn
      .select("id, created_at, target_calories, b_name:breakfast->>name, b_cal:breakfast->>total_calories, l_name:lunch->>name, l_cal:lunch->>total_calories, d_name:dinner->>name, d_cal:dinner->>total_calories")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(20)
      .then(
        (r) => r,
        () => ({ data: null, error: { message: "network" } }),
      ),
  ]);
  if (plansRes.error) console.error("Không đọc được thực đơn đã lưu:", plansRes.error.message);
  type PlanRaw = { id: string; created_at: string; target_calories: number; b_name: string | null; b_cal: string | null; l_name: string | null; l_cal: string | null; d_name: string | null; d_cal: string | null };
  const meal = (name: string | null, cal: string | null) => (name ? { name, total_calories: Number(cal) || 0 } : null);
  const plans: SavedPlanRow[] | null = plansRes.error
    ? null
    : ((plansRes.data ?? []) as unknown as PlanRaw[]).map((p) => ({
        id: p.id,
        created_at: p.created_at,
        target_calories: p.target_calories,
        breakfast: meal(p.b_name, p.b_cal),
        lunch: meal(p.l_name, p.l_cal),
        dinner: meal(p.d_name, p.d_cal),
      }));

  if (larkRes.error) console.error("Không đọc được cài đặt Lark:", larkRes.error.message);
  const lark = larkRes.error ? null : larkRes.data;

  const name = displayNameOf(profile, user.email);

  return (
    <main className="mx-auto w-full max-w-2xl space-y-5 px-4 py-8 sm:py-12">
      <header className="animate-enter flex items-center gap-4">
        <span
          aria-hidden
          className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-brand-600 text-2xl font-bold text-white"
        >
          {initialOf(name)}
        </span>
        <div className="min-w-0">
          <p className="text-sm font-semibold text-brand-600">Hồ sơ của bạn</p>
          <h1 className="truncate text-2xl font-bold tracking-tight text-ink sm:text-3xl">Xin chào, {name}!</h1>
          <p className="truncate text-sm text-muted">{user.email}</p>
        </div>
      </header>

      <Section id="thong-tin" title="Thông tin cơ thể" icon={Icons.user}>
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

      <Section id="nhac-nho-lark" title="Nhắc nhở qua Lark" icon={Icons.heartbeat}>
        <p className="-mt-2 mb-4 text-sm text-muted">Nhận nhắc uống nước, vận động, giờ ăn và cảnh báo khi ăn quá calo ngay trong Lark.</p>
        <LarkSettings
          initial={{
            connected: !!lark,
            enabled: lark?.enabled ?? true,
            water: lark?.water_on ?? true,
            move: lark?.move_on ?? true,
            meal: lark?.meal_on ?? true,
            calorie: lark?.calorie_on ?? true,
          }}
        />
      </Section>

      <Section id="thuc-don-da-luu" title="Thực đơn đã lưu" icon={Icons.plan}>
        <SavedPlansList plans={plans} />
      </Section>

      <Section id="tai-khoan" title="Tài khoản" icon={Icons.settings}>
        <h3 className="font-semibold text-ink">Đổi mật khẩu</h3>
        <div className="mt-3">
          <NewPasswordForm submitText="Đổi mật khẩu" />
        </div>
        <div className="mt-6 border-t border-line pt-5">
          <form action={signOut}>
            <button type="submit" className={buttonClass("secondary", "md", "w-full sm:w-auto")}>
              <Icon icon={Icons.logout} size={18} />
              Đăng xuất
            </button>
          </form>
        </div>
      </Section>
    </main>
  );
}
