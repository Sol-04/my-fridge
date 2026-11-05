// Tiện ích dùng chung cho đăng nhập (chạy ở máy chủ).
import "server-only";

import { headers } from "next/headers";

// Chỉ cho phép chuyển tới đường dẫn NỘI BỘ (bắt đầu bằng "/"), tránh bị lợi dụng chuyển sang trang lạ.
export function safeNext(next: unknown, fallback = "/ho-so"): string {
  if (typeof next !== "string") return fallback;
  if (!next.startsWith("/") || next.startsWith("//") || next.startsWith("/\\")) return fallback;
  if (next.startsWith("/auth/")) return fallback;
  return next.slice(0, 200);
}

// Địa chỉ gốc của web (ví dụ https://my-fridge.vercel.app) để tạo link trong email.
export async function getOrigin(): Promise<string> {
  const h = await headers();
  const origin = h.get("origin");
  if (origin) return origin;
  const host = h.get("x-forwarded-host") ?? h.get("host") ?? "localhost:3000";
  const proto = h.get("x-forwarded-proto") ?? (host.startsWith("localhost") ? "http" : "https");
  return `${proto}://${host}`;
}

export const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
export const PASSWORD_MIN = 8;

// Dịch lỗi Supabase Auth sang tiếng Việt dễ hiểu.
export function authErrorMessage(err: { code?: string; message?: string; status?: number } | null | undefined): string {
  const code = err?.code ?? "";
  const msg = (err?.message ?? "").toLowerCase();
  if (code === "invalid_credentials" || msg.includes("invalid login credentials"))
    return "Email hoặc mật khẩu chưa đúng. Bạn kiểm tra lại nhé.";
  if (code === "email_not_confirmed" || msg.includes("email not confirmed"))
    return "Email chưa được xác nhận. Hãy mở hộp thư và bấm vào link xác nhận trước khi đăng nhập.";
  if (code === "user_already_exists" || code === "email_exists" || msg.includes("already registered"))
    return "Email này đã được đăng ký. Bạn hãy đăng nhập, hoặc dùng “Quên mật khẩu” nếu không nhớ mật khẩu.";
  if (code === "weak_password" || msg.includes("password should"))
    return `Mật khẩu chưa đủ mạnh. Hãy dùng ít nhất ${PASSWORD_MIN} ký tự, nên có cả chữ và số.`;
  if (code === "same_password") return "Mật khẩu mới phải khác mật khẩu đang dùng.";
  if (code.startsWith("over_") || err?.status === 429 || msg.includes("rate limit"))
    return "Bạn thao tác hơi nhanh. Vui lòng đợi vài phút rồi thử lại.";
  if (code === "signup_disabled") return "Hiện chưa mở đăng ký tài khoản mới. Vui lòng quay lại sau.";
  if (code === "session_not_found" || code === "session_expired" || msg.includes("auth session missing"))
    return "Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.";
  if (msg.includes("fetch failed") || msg.includes("network"))
    return "Không kết nối được máy chủ. Bạn kiểm tra mạng rồi thử lại nhé.";
  return "Có lỗi xảy ra. Vui lòng thử lại sau ít phút.";
}
