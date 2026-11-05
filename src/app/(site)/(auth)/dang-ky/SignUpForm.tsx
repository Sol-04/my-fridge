"use client";

import { useActionState } from "react";

import { PasswordField, SubmitButton, TextField } from "@/components/form";
import { Notice } from "@/components/ui";

import { signUp, type AuthFormState } from "../actions";
import { Icons } from "@/components/icons";

export function SignUpForm({ next }: { next: string }) {
  const [state, action] = useActionState<AuthFormState, FormData>(signUp, {});

  if (state.success) {
    return (
      <Notice tone="success" icon={Icons.mail} title="Kiểm tra hộp thư của bạn">
        {state.success}
      </Notice>
    );
  }

  return (
    <form action={action} noValidate className="space-y-4">
      <input type="hidden" name="next" value={next} />
      {state.error && <Notice tone="error">{state.error}</Notice>}
      <TextField
        label="Tên của bạn"
        name="displayName"
        autoComplete="name"
        placeholder="Ví dụ: Uyên"
        maxLength={60}
        defaultValue={state.values?.displayName}
        error={state.fieldErrors?.displayName}
        required
      />
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
      <PasswordField
        label="Mật khẩu"
        name="password"
        autoComplete="new-password"
        hint="Ít nhất 8 ký tự, nên có cả chữ và số."
        error={state.fieldErrors?.password}
        required
      />
      <SubmitButton pendingText="Đang tạo tài khoản…">Tạo tài khoản</SubmitButton>
      <p className="text-center text-xs text-muted">
        Thông tin cơ thể bạn nhập chỉ dùng để tính calo và chỉ bạn xem được.
      </p>
    </form>
  );
}
