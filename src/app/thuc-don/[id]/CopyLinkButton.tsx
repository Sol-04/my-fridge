"use client";

import { useState } from "react";

// Nút "Sao chép link" — nếu trình duyệt không cho sao chép, hiện ô chứa link để tự copy.
export function CopyLinkButton() {
  const [status, setStatus] = useState<"idle" | "copied" | "manual">("idle");
  const [url, setUrl] = useState("");

  const copy = async () => {
    const link = window.location.href;
    setUrl(link);
    try {
      await navigator.clipboard.writeText(link);
      setStatus("copied");
      setTimeout(() => setStatus("idle"), 2000);
    } catch {
      setStatus("manual");
    }
  };

  return (
    <div>
      <button
        type="button"
        onClick={copy}
        className="inline-flex min-h-12 w-full items-center justify-center rounded-full bg-emerald-600 px-6 font-semibold text-white transition hover:bg-emerald-700 sm:w-auto"
      >
        {status === "copied" ? "Đã sao chép ✓" : "🔗 Sao chép link"}
      </button>
      <span className="sr-only" aria-live="polite">
        {status === "copied" ? "Đã sao chép link" : ""}
      </span>
      {status === "manual" && (
        <label className="mt-3 block text-sm text-zinc-600 dark:text-zinc-400">
          Không sao chép tự động được. Hãy giữ ngón tay vào ô dưới để copy:
          <input
            readOnly
            value={url}
            onFocus={(e) => e.currentTarget.select()}
            className="mt-1 min-h-11 w-full rounded-xl border border-zinc-300 bg-white px-3 text-zinc-900 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
          />
        </label>
      )}
    </div>
  );
}
