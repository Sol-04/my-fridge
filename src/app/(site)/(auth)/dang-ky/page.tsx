import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Suspense } from "react";

import { safeNext } from "@/lib/auth-helpers";
import { getCurrentUser } from "@/lib/supabase/server";

import { AuthFormSkeleton, AuthShell } from "../AuthShell";
import { SignUpForm } from "./SignUpForm";
import { Icons } from "@/components/icons";

export const metadata: Metadata = { title: "Đăng ký – Glow up with me" };

export default function SignUpPage({ searchParams }: PageProps<"/dang-ky">) {
  return (
    <AuthShell
      icon={Icons.logo}
      title="Tạo tài khoản miễn phí"
      subtitle="Lưu hồ sơ để tự điền thông tin, lưu và xem lại các thực đơn của bạn."
      footer={
        <>
          Đã có tài khoản?{" "}
          <Link href="/dang-nhap" className="inline-flex min-h-11 items-center font-semibold text-brand-700 hover:underline">
            Đăng nhập
          </Link>
        </>
      }
    >
      <Suspense fallback={<AuthFormSkeleton fields={3} />}>
        <SignUpGate searchParams={searchParams} />
      </Suspense>
    </AuthShell>
  );
}

async function SignUpGate({ searchParams }: { searchParams: PageProps<"/dang-ky">["searchParams"] }) {
  const sp = await searchParams;
  const next = safeNext(sp.next);
  if (await getCurrentUser()) redirect(next);
  return <SignUpForm next={next} />;
}
