// Kết nối Supabase CÓ phiên đăng nhập (đọc/ghi cookie). Chỉ dùng ở máy chủ:
// Server Component, Server Action, Route Handler. Mỗi yêu cầu tạo 1 kết nối mới.
import "server-only";

import { createServerClient } from "@supabase/ssr";
import type { SupabaseClient, User } from "@supabase/supabase-js";
import { cookies } from "next/headers";
import { connection } from "next/server";

import { getSupabaseEnv } from "./env";

export async function createSupabaseServer(): Promise<SupabaseClient | null> {
  const env = getSupabaseEnv();
  if (!env) return null;
  // Thư viện Supabase đọc giờ hiện tại (kiểm tra hạn phiên) → chỉ chạy khi có yêu cầu thật, không lúc dựng sẵn trang.
  await connection();
  const cookieStore = await cookies();
  return createServerClient(env.url, env.anonKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options));
        } catch {
          // Trong Server Component không ghi được cookie — proxy.ts sẽ làm mới phiên đăng nhập.
        }
      },
    },
  });
}

// Người dùng đang đăng nhập (đã xác minh với Supabase), hoặc null.
export async function getCurrentUser(): Promise<User | null> {
  const supabase = await createSupabaseServer();
  if (!supabase) return null;
  try {
    const { data, error } = await supabase.auth.getUser();
    if (error) return null;
    return data.user ?? null;
  } catch {
    return null;
  }
}
