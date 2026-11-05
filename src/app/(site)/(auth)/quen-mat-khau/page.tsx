import type { Metadata } from "next";
import Link from "next/link";

import { AuthShell } from "../AuthShell";
import { ForgotPasswordForm } from "./ForgotPasswordForm";
import { Icons } from "@/components/icons";

export const metadata: Metadata = { title: "Quên mật khẩu – My Fridge" };

export default function ForgotPasswordPage() {
  return (
    <AuthShell
      icon={Icons.key}
      title="Quên mật khẩu?"
      subtitle="Nhập email bạn đã dùng để đăng ký, chúng tôi sẽ gửi link đặt lại mật khẩu."
      footer={
        <Link href="/dang-nhap" className="inline-flex min-h-11 items-center font-semibold text-brand-700 hover:underline">
          ← Quay lại đăng nhập
        </Link>
      }
    >
      <ForgotPasswordForm />
    </AuthShell>
  );
}
