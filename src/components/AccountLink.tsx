import Link from "next/link";

import { displayNameOf, getProfile, initialOf } from "@/lib/profile";
import { createSupabaseServer } from "@/lib/supabase/server";

// Nút tài khoản trên menu: "Đăng nhập" hoặc vòng tròn chữ cái đầu của tên (dẫn tới hồ sơ).
export async function AccountLink() {
  const supabase = await createSupabaseServer();
  const user = supabase ? (await supabase.auth.getUser().catch(() => null))?.data.user ?? null : null;

  if (!supabase || !user) {
    return (
      <Link
        href="/dang-nhap"
        className="inline-flex min-h-11 items-center rounded-full px-2.5 text-sm font-semibold whitespace-nowrap text-brand-700 hover:bg-brand-50 sm:px-3"
      >
        Đăng nhập
      </Link>
    );
  }

  const name = displayNameOf(await getProfile(supabase, user.id), user.email);
  return (
    <Link
      href="/ho-so"
      aria-label={`Hồ sơ của ${name}`}
      title="Hồ sơ của bạn"
      className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-brand-100 text-base font-bold text-brand-800 ring-2 ring-white transition hover:bg-brand-200"
    >
      {initialOf(name)}
    </Link>
  );
}

// Chỗ giữ chỗ trong lúc đang kiểm tra đăng nhập (để menu không bị nhảy)
export function AccountLinkPlaceholder() {
  return <span aria-hidden className="block h-11 w-11 shrink-0 rounded-full bg-brand-50" />;
}
