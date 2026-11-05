import type { Metadata } from "next";
import { Suspense } from "react";

import { ButtonLink, Notice } from "@/components/ui";
import { getCurrentUser } from "@/lib/supabase/server";

import { AuthFormSkeleton, AuthShell } from "../AuthShell";
import { NewPasswordForm } from "./NewPasswordForm";
import { Icons } from "@/components/icons";

export const metadata: Metadata = { title: "Đặt lại mật khẩu – My Fridge", robots: { index: false } };

export default function ResetPasswordPage() {
  return (
    <AuthShell icon={Icons.lock} title="Đặt mật khẩu mới" subtitle="Chọn mật khẩu mới cho tài khoản của bạn.">
      <Suspense fallback={<AuthFormSkeleton />}>
        <ResetGate />
      </Suspense>
    </AuthShell>
  );
}

async function ResetGate() {
  // Trang này chỉ dùng được sau khi bấm link trong email (link đã đăng nhập tạm cho bạn)
  if (!(await getCurrentUser())) {
    return (
      <Notice
        tone="warning"
        icon={Icons.expired}
        title="Link đặt lại mật khẩu đã hết hạn"
        action={<ButtonLink href="/quen-mat-khau">Gửi lại link mới</ButtonLink>}
      >
        Link chỉ dùng được một lần và trong thời gian ngắn. Bạn hãy yêu cầu link mới nhé.
      </Notice>
    );
  }
  return <NewPasswordForm redirectTo="/ho-so" />;
}
