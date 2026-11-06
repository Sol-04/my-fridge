import type { Metadata } from "next";

import { Icon, Icons } from "@/components/icons";

export const metadata: Metadata = { title: "Đang offline – Glow up with me", robots: { index: false } };

// Trang tĩnh (không đọc phiên đăng nhập) để service worker lưu sẵn, hiện khi điện thoại mất mạng.
export default function OfflinePage() {
  return (
    <main className="mx-auto flex w-full max-w-md flex-1 flex-col items-center justify-center gap-4 px-4 py-16 text-center">
      <span className="flex h-16 w-16 items-center justify-center rounded-full bg-aqua-50 text-aqua-800">
        <Icon icon={Icons.offline} size={32} />
      </span>
      <h1 className="text-2xl font-bold text-ink">Bạn đang không có mạng</h1>
      <p className="text-muted">Glow up with me cần mạng để tải món ăn và nhật ký của bạn. Bật Wi-Fi hoặc dữ liệu di động rồi mở lại nhé.</p>
      {/* eslint-disable-next-line @next/next/no-html-link-for-pages -- cần tải lại trang từ mạng, không dùng điều hướng trong app */}
      <a href="/" className="inline-flex min-h-12 items-center justify-center rounded-2xl bg-brand-600 px-5 font-semibold text-white transition duration-200 hover:bg-brand-700 active:translate-y-px">
        Thử lại
      </a>
    </main>
  );
}
