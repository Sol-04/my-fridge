"use client";

import { useEffect } from "react";

import { buttonClass, ButtonLink, EmptyState } from "@/components/ui";

// Hiện khi một trang gặp lỗi bất ngờ (thay vì màn hình trắng).
export default function SiteError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <main className="mx-auto w-full max-w-md flex-1 px-4 py-12">
      <EmptyState
        icon="😕"
        title="Ôi, có lỗi xảy ra"
        action={
          <div className="flex flex-col gap-3 sm:flex-row">
            <button type="button" onClick={reset} className={buttonClass("primary")}>
              Thử lại
            </button>
            <ButtonLink href="/" variant="secondary">
              Về trang chủ
            </ButtonLink>
          </div>
        }
      >
        Trang chưa tải được. Bạn kiểm tra kết nối mạng rồi bấm “Thử lại” nhé. Nếu vẫn lỗi, hãy quay lại sau ít phút.
      </EmptyState>
    </main>
  );
}
