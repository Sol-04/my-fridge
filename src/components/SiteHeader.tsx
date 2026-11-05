import Link from "next/link";
import { Suspense } from "react";

import { AccountLink, AccountLinkPlaceholder } from "./AccountLink";
import { HeaderNav, HeaderNavItems } from "./HeaderNav";
import { Icon, Icons } from "./icons";

// Menu điều hướng: logo + liên kết + nút "Tạo thực đơn" + tài khoản. Dính ở đầu màn hình khi cuộn.
export function SiteHeader() {
  return (
    <header className="sticky top-0 z-[100] border-b border-line bg-white/90 backdrop-blur">
      <div className="mx-auto flex h-16 w-full max-w-5xl items-center gap-1 px-4 sm:gap-2 sm:px-6">
        <Link
          href="/"
          aria-label="Glow up with me – Trang chủ"
          className="mr-auto flex min-h-11 shrink-0 items-center gap-2 font-bold whitespace-nowrap text-brand-700"
        >
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-600 text-white">
            <Icon icon={Icons.logo} size={20} />
          </span>
          {/* Trên điện thoại chỉ hiện biểu tượng để đủ chỗ cho menu */}
          <span className="hidden text-lg tracking-tight sm:inline">Glow up with me</span>
        </Link>
        {/* Bản chưa đánh dấu mục đang xem được tạo sẵn; mục đang xem được đánh dấu khi trang mở ra */}
        <Suspense fallback={<HeaderNavItems pathname={null} />}>
          <HeaderNav />
        </Suspense>
        <Suspense fallback={<AccountLinkPlaceholder />}>
          <AccountLink />
        </Suspense>
      </div>
    </header>
  );
}
