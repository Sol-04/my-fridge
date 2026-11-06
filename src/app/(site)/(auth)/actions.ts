"use server";

// Đăng ký, đăng nhập, đăng xuất, quên / đặt lại mật khẩu (chạy ở máy chủ).
import { redirect } from "next/navigation";

import { authErrorMessage, EMAIL_RE, getOrigin, PASSWORD_MIN, safeNext } from "@/lib/auth-helpers";
import { createSupabaseServer } from "@/lib/supabase/server";

export type AuthFormState = {
  error?: string;
  success?: string;
  fieldErrors?: Partial<Record<"displayName" | "email" | "password" | "confirm", string>>;
  values?: { displayName?: string; email?: string };
};

const NOT_CONFIGURED = "Hệ thống đăng nhập đang tạm thời chưa sẵn sàng. Vui lòng thử lại sau.";

const str = (fd: FormData, key: string) => String(fd.get(key) ?? "").trim();

// ---------- Đăng nhập ----------
export async function signIn(_prev: AuthFormState, fd: FormData): Promise<AuthFormState> {
  const email = str(fd, "email").toLowerCase();
  const password = String(fd.get("password") ?? "");
  const next = safeNext(fd.get("next"));
  const fieldErrors: AuthFormState["fieldErrors"] = {};
  if (!EMAIL_RE.test(email)) fieldErrors.email = "Email chưa đúng dạng, ví dụ: ten@gmail.com";
  if (!password) fieldErrors.password = "Vui lòng nhập mật khẩu";
  if (Object.keys(fieldErrors).length) return { fieldErrors, values: { email } };

  const supabase = await createSupabaseServer();
  if (!supabase) return { error: NOT_CONFIGURED, values: { email } };
  try {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) return { error: authErrorMessage(error), values: { email } };
  } catch (err) {
    return { error: authErrorMessage({ message: String(err) }), values: { email } };
  }
  redirect(next);
}

// ---------- Đăng ký ----------
export async function signUp(_prev: AuthFormState, fd: FormData): Promise<AuthFormState> {
  const displayName = str(fd, "displayName").slice(0, 60);
  const email = str(fd, "email").toLowerCase();
  const password = String(fd.get("password") ?? "");
  const next = safeNext(fd.get("next"));
  const values = { displayName, email };
  const fieldErrors: AuthFormState["fieldErrors"] = {};
  if (!displayName) fieldErrors.displayName = "Vui lòng nhập tên để Glow up with me gọi bạn";
  if (!EMAIL_RE.test(email)) fieldErrors.email = "Email chưa đúng dạng, ví dụ: ten@gmail.com";
  if (password.length < PASSWORD_MIN) fieldErrors.password = `Mật khẩu cần ít nhất ${PASSWORD_MIN} ký tự`;
  if (Object.keys(fieldErrors).length) return { fieldErrors, values };

  const supabase = await createSupabaseServer();
  if (!supabase) return { error: NOT_CONFIGURED, values };
  let hasSession = false;
  try {
    const origin = await getOrigin();
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { display_name: displayName },
        emailRedirectTo: `${origin}/auth/callback?next=${encodeURIComponent(next)}`,
      },
    });
    if (error) return { error: authErrorMessage(error), values };
    hasSession = !!data.session;
  } catch (err) {
    return { error: authErrorMessage({ message: String(err) }), values };
  }
  // Supabase tắt "xác nhận email" → đã đăng nhập luôn
  if (hasSession) redirect(next);
  return {
    success: `Gần xong rồi! Chúng tôi đã gửi email xác nhận tới ${email}. Hãy mở hộp thư (kể cả mục Spam) và bấm vào link để kích hoạt tài khoản.`,
    values,
  };
}

// ---------- Đăng xuất ----------
export async function signOut(): Promise<void> {
  const supabase = await createSupabaseServer();
  try {
    await supabase?.auth.signOut();
  } catch {
    // Dù lỗi mạng vẫn đưa người dùng về trang chủ
  }
  redirect("/");
}

// ---------- Quên mật khẩu: gửi email đặt lại ----------
export async function requestPasswordReset(_prev: AuthFormState, fd: FormData): Promise<AuthFormState> {
  const email = str(fd, "email").toLowerCase();
  if (!EMAIL_RE.test(email)) {
    return { fieldErrors: { email: "Email chưa đúng dạng, ví dụ: ten@gmail.com" }, values: { email } };
  }
  const supabase = await createSupabaseServer();
  if (!supabase) return { error: NOT_CONFIGURED, values: { email } };
  try {
    const origin = await getOrigin();
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${origin}/auth/callback?next=/dat-lai-mat-khau`,
    });
    // Chỉ báo lỗi khi bị giới hạn lượt; còn lại luôn báo chung chung để không lộ email nào đã đăng ký.
    if (error && (error.code?.startsWith("over_") || error.status === 429)) {
      return { error: authErrorMessage(error), values: { email } };
    }
    if (error) console.error("Gửi email đặt lại mật khẩu lỗi:", error.message);
  } catch (err) {
    return { error: authErrorMessage({ message: String(err) }), values: { email } };
  }
  return {
    success: `Nếu ${email} đã đăng ký, chúng tôi vừa gửi link đặt lại mật khẩu. Hãy mở hộp thư (kể cả mục Spam) và bấm vào link trong 1 giờ tới.`,
    values: { email },
  };
}

// ---------- Đặt / đổi mật khẩu (sau khi bấm link email, hoặc trong trang hồ sơ) ----------
export async function updatePassword(_prev: AuthFormState, fd: FormData): Promise<AuthFormState> {
  const password = String(fd.get("password") ?? "");
  const confirm = String(fd.get("confirm") ?? "");
  const redirectTo = fd.get("redirectTo");
  const fieldErrors: AuthFormState["fieldErrors"] = {};
  if (password.length < PASSWORD_MIN) fieldErrors.password = `Mật khẩu cần ít nhất ${PASSWORD_MIN} ký tự`;
  else if (password !== confirm) fieldErrors.confirm = "Hai mật khẩu chưa giống nhau";
  if (Object.keys(fieldErrors).length) return { fieldErrors };

  const supabase = await createSupabaseServer();
  if (!supabase) return { error: NOT_CONFIGURED };
  try {
    const { data: userData } = await supabase.auth.getUser();
    if (!userData.user) return { error: "Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại hoặc gửi lại link đặt mật khẩu." };
    const { error } = await supabase.auth.updateUser({ password });
    if (error) return { error: authErrorMessage(error) };
  } catch (err) {
    return { error: authErrorMessage({ message: String(err) }) };
  }
  if (typeof redirectTo === "string" && redirectTo) redirect(safeNext(redirectTo));
  return { success: "Đã đổi mật khẩu thành công." };
}
