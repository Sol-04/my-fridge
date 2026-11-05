// Nhận link từ email (xác nhận tài khoản / đặt lại mật khẩu), đổi mã trong link thành phiên đăng nhập rồi chuyển tiếp.
import type { EmailOtpType } from "@supabase/supabase-js";
import { NextResponse, type NextRequest } from "next/server";

import { safeNext } from "@/lib/auth-helpers";
import { createSupabaseServer } from "@/lib/supabase/server";

export async function GET(request: NextRequest) {
  const url = request.nextUrl;
  const next = safeNext(url.searchParams.get("next"));
  const code = url.searchParams.get("code");
  const tokenHash = url.searchParams.get("token_hash");
  const type = url.searchParams.get("type") as EmailOtpType | null;

  const supabase = await createSupabaseServer();
  if (supabase) {
    try {
      if (code) {
        const { error } = await supabase.auth.exchangeCodeForSession(code);
        if (!error) return NextResponse.redirect(new URL(next, url.origin));
      } else if (tokenHash && type) {
        const { error } = await supabase.auth.verifyOtp({ token_hash: tokenHash, type });
        if (!error) return NextResponse.redirect(new URL(next, url.origin));
      }
    } catch (err) {
      console.error("Xử lý link email lỗi:", err instanceof Error ? err.message : err);
    }
  }
  // Link hết hạn / đã dùng / sai → về trang đăng nhập kèm thông báo
  return NextResponse.redirect(new URL("/dang-nhap?loi=link", url.origin));
}
