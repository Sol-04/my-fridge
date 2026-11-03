"use client";

import Link from "next/link";
import { useActionState } from "react";

import { PasswordField, SubmitButton, TextField } from "@/components/form";
import { Notice } from "@/components/ui";

import { signIn, type AuthFormState } from "../actions";

export function SignInForm({ next, linkError }: { next: string; linkError?: boolean }) {
  const [state, action] = useActionState<AuthFormState, FormData>(signIn, {});
  return (
    <form action={action} noValidate className="space-y-4">
      <input type="hidden" name="next" value={next} />
      {linkError && !state.error && (
        <Notice tone="warning" icon="⏰" title="Link đã hết hạn hoặc đã được dùng">
          Bạn hãy đăng nhập lại, hoặc dùng “Quên mật khẩu” để nhận link mới.
        </Notice>
      )}
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
      <PasswordField
        label="Mật khẩu"
        name="password"
        autoComplete="current-password"
        error={state.fieldErrors?.password}
        required
      />
      <div className="-mt-1 text-right">
        <Link href="/quen-mat-khau" className="inline-flex min-h-11 items-center text-sm font-semibold text-brand-700 hover:underline">
          Quên mật khẩu?
        </Link>
      </div>
      <SubmitButton pendingText="Đang đăng nhập…">Đăng nhập</SubmitButton>
    </form>
  );
}
