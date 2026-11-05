"use client";

import { useState } from "react";

import { buttonClass } from "@/components/ui";
import { Icon, Icons } from "@/components/icons";

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
        className={buttonClass("primary", "md", "w-full sm:w-auto")}
      >
        <Icon icon={status === "copied" ? Icons.check : Icons.link} size={18} />
        {status === "copied" ? "Đã sao chép link" : "Sao chép link"}
      </button>
      <span className="sr-only" aria-live="polite">
        {status === "copied" ? "Đã sao chép link" : ""}
      </span>
      {status === "manual" && (
        <label className="mt-3 block text-sm text-ink">
          Không sao chép tự động được. Hãy giữ ngón tay vào ô dưới để copy:
          <input
            readOnly
            value={url}
            onFocus={(e) => e.currentTarget.select()}
            className="mt-1 min-h-12 w-full rounded-2xl border border-line bg-white px-3 text-ink"
          />
        </label>
      )}
    </div>
  );
}
