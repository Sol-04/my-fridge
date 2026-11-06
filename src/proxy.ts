// Chạy trước mỗi trang: làm mới phiên đăng nhập Supabase (cookie) để người dùng không bị đăng xuất giữa chừng.
import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

import { getSupabaseEnv } from "@/lib/supabase/env";

export async function proxy(request: NextRequest) {
  let response = NextResponse.next({ request });

  const env = getSupabaseEnv();
  // Chưa cấu hình, hoặc người dùng chưa từng đăng nhập (không có cookie Supabase) → bỏ qua cho nhanh.
  const hasAuthCookie = request.cookies.getAll().some((c) => c.name.startsWith("sb-"));
  if (!env || !hasAuthCookie) return response;

  const supabase = createServerClient(env.url, env.anonKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet, headers) {
        cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
        response = NextResponse.next({ request });
        cookiesToSet.forEach(({ name, value, options }) => response.cookies.set(name, value, options));
        Object.entries(headers ?? {}).forEach(([key, value]) => response.headers.set(key, value));
      },
    },
  });

  try {
    await supabase.auth.getClaims();
  } catch {
    // Lỗi mạng tạm thời: vẫn cho trang hiển thị bình thường.
  }
  return response;
}

export const config = {
  // Không chạy cho trang quản trị, file hệ thống và file tĩnh (ảnh, icon…)
  matcher: ["/((?!studio|_next/static|_next/image|favicon.ico|sw\\.js|manifest.webmanifest|offline|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)"],
};
