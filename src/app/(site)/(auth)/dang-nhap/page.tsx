import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Suspense } from "react";

import { safeNext } from "@/lib/auth-helpers";
import { getCurrentUser } from "@/lib/supabase/server";

import { AuthFormSkeleton, AuthShell } from "../AuthShell";
import { SignInForm } from "./SignInForm";

export const metadata: Metadata = { title: "Đăng nhập – My Fridge" };

export default function SignInPage({ searchParams }: PageProps<"/dang-nhap">) {
  return (
    <AuthShell
      icon="👋"
      title="Chào mừng trở lại!"
      subtitle="Đăng nhập để lưu thực đơn và xem lại bất cứ lúc nào."
      footer={
        <>
          Chưa có tài khoản?{" "}
          <Link href="/dang-ky" className="inline-flex min-h-11 items-center font-semibold text-brand-700 hover:underline">
            Đăng ký miễn phí
          </Link>
        </>
      }
    >
      <Suspense fallback={<AuthFormSkeleton />}>
        <SignInGate searchParams={searchParams} />
      </Suspense>
    </AuthShell>
  );
}

async function SignInGate({ searchParams }: { searchParams: PageProps<"/dang-nhap">["searchParams"] }) {
  const sp = await searchParams;
  const next = safeNext(sp.next);
  if (await getCurrentUser()) redirect(next);
  return <SignInForm next={next} linkError={sp.loi === "link"} />;
}
