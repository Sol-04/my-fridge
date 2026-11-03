"use client";

import { useActionState } from "react";

import { SubmitButton, TextField } from "@/components/form";
import { Notice } from "@/components/ui";

import { requestPasswordReset, type AuthFormState } from "../actions";

export function ForgotPasswordForm() {
  const [state, action] = useActionState<AuthFormState, FormData>(requestPasswordReset, {});
  if (state.success) {
    return (
      <Notice tone="success" icon="📬" title="Đã gửi yêu cầu">
        {state.success}
      </Notice>
    );
  }
  return (
    <form action={action} noValidate className="space-y-4">
      {state.error && <Notice tone="error">{state.error}</Notice>}
      <TextField
        label="Email"
        name="email"
        type="email"
        inputMode="email"
        autoComplete="email"
        placeholder="ten@gmail.com"
        defaultValue={state.values?.email}
        error={state.fieldErrors?.email}
        required
      />
      <SubmitButton pendingText="Đang gửi…">Gửi link đặt lại mật khẩu</SubmitButton>
    </form>
  );
}
