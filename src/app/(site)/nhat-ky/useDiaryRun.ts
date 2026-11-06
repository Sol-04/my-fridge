"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

import type { DiaryResult } from "./actions";

// Chạy 1 hành động ghi nhật ký: hiện "đang xử lý", giữ lỗi để hiện Notice, chưa đăng nhập thì chuyển tới trang đăng nhập.
export function useDiaryRun() {
  const router = useRouter();
  const [pending, start] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const run = (action: () => Promise<DiaryResult>, onOk?: () => void) => {
    setError(null);
    start(async () => {
      try {
        const res = await action();
        if (res.ok) return onOk?.();
        if (res.needLogin) return router.push("/dang-nhap?next=/nhat-ky");
        setError(res.error);
      } catch {
        setError("Có thể mạng đang chậm hoặc bị ngắt. Bạn đợi một chút rồi thử lại nhé.");
      }
    });
  };
  return { pending, error, setError, run };
}

// Kiểu ô chọn (select) khớp với ô nhập trong form.tsx
export const selectClass =
  "min-h-12 w-full rounded-2xl border border-line bg-white px-3 text-base text-ink outline-none transition duration-200 focus:ring-2 focus:ring-brand-500 focus:ring-offset-2 focus:ring-offset-canvas disabled:opacity-60";
