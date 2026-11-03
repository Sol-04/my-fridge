"use client";

import { useActionState } from "react";

import { PasswordField, SubmitButton } from "@/components/form";
import { Notice } from "@/components/ui";

import { updatePassword, type AuthFormState } from "../actions";

// Form đặt mật khẩu mới — dùng ở trang đặt lại mật khẩu và trang hồ sơ.
export function NewPasswordForm({ redirectTo, submitText = "Lưu mật khẩu mới" }: { redirectTo?: string; submitText?: string }) {
  const [state, action] = useActionState<AuthFormState, FormData>(updatePassword, {});
  return (
    <form action={action} noValidate className="space-y-4">
      {redirectTo && <input type="hidden" name="redirectTo" value={redirectTo} />}
      {state.error && <Notice tone="error">{state.error}</Notice>}
      {state.success && <Notice tone="success">{state.success}</Notice>}
      <PasswordField
        label="Mật khẩu mới"
        name="password"
        autoComplete="new-password"
        hint="Ít nhất 8 ký tự, nên có cả chữ và số."
        error={state.fieldErrors?.password}
        required
      />
      <PasswordField
        label="Nhập lại mật khẩu mới"
        name="confirm"
        autoComplete="new-password"
        error={state.fieldErrors?.confirm}
        required
      />
      <SubmitButton pendingText="Đang lưu…">{submitText}</SubmitButton>
    </form>
  );
}
