"use client";

// Khung Nhật ký: đổi ngày + 3 tab. Đổi tab chỉ ẩn / hiện ngay trên điện thoại (dữ liệu cả 3 tab đã được tải sẵn cùng trang),
// không tải lại trang từ máy chủ nên không bị trễ. Đổi ngày thì vẫn tải dữ liệu của ngày mới.
import Link from "next/link";
import { useState, type ReactNode } from "react";

import { Icon, Icons } from "@/components/icons";
import { buttonClass } from "@/components/ui";
import { addDays, formatDiaryDate } from "@/lib/diary";

export type DiaryTabKey = "an" | "tap" | "suc-khoe";

const TABS: { key: DiaryTabKey; label: string; icon: typeof Icons.allMeals }[] = [
  { key: "an", label: "Ăn uống", icon: Icons.allMeals },
  { key: "tap", label: "Tập luyện", icon: Icons.workout },
  { key: "suc-khoe", label: "Sức khoẻ", icon: Icons.heartbeat },
];

const navBtn =
  "inline-flex min-h-11 min-w-11 shrink-0 items-center justify-center rounded-2xl border-[1.5px] border-line bg-white text-brand-700 transition duration-200 hover:border-brand-300 hover:bg-brand-50 active:translate-y-px";

export function DiaryShell({
  date,
  today,
  initialTab,
  between,
  panels,
}: {
  date: string;
  today: string;
  initialTab: DiaryTabKey;
  between: ReactNode; // tổng calo + lưu ý (hiện ở mọi tab)
  panels: Record<DiaryTabKey, ReactNode>;
}) {
  const [tab, setTab] = useState<DiaryTabKey>(initialTab);

  const href = (d: string, t: DiaryTabKey) => {
    const q = new URLSearchParams();
    if (d !== today) q.set("ngay", d);
    if (t !== "an") q.set("tab", t);
    const s = q.toString();
    return s ? `/nhat-ky?${s}` : "/nhat-ky";
  };

  const choose = (t: DiaryTabKey) => {
    setTab(t);
    // Giữ địa chỉ trang đúng (tải lại / chia sẻ vẫn mở đúng tab) mà không điều hướng, không gọi máy chủ
    window.history.replaceState(window.history.state, "", href(date, t));
  };

  return (
    <>
      <nav aria-label="Chọn ngày" className="animate-enter flex items-center gap-2">
        <Link href={href(addDays(date, -1), tab)} className={navBtn} aria-label="Ngày trước">
          <Icon icon={Icons.prevDay} size={20} />
        </Link>
        <p className="min-w-0 flex-1 text-center text-base font-bold text-ink" aria-live="polite">
          {formatDiaryDate(date)}
        </p>
        <Link href={href(addDays(date, 1), tab)} className={navBtn} aria-label="Ngày sau">
          <Icon icon={Icons.nextDay} size={20} />
        </Link>
        {date !== today && (
          <Link href={href(today, tab)} className={buttonClass("secondary", "md", "min-h-11 shrink-0 px-3 text-sm")}>
            Hôm nay
          </Link>
        )}
      </nav>

      <div role="tablist" aria-label="Phần nhật ký" className="animate-enter grid grid-cols-3 gap-2 rounded-2xl border border-line bg-white p-1.5">
        {TABS.map((t) => (
          <button
            key={t.key}
            type="button"
            role="tab"
            id={`tab-${t.key}`}
            aria-selected={tab === t.key}
            aria-controls={`panel-${t.key}`}
            onClick={() => choose(t.key)}
            className={`inline-flex min-h-11 items-center justify-center gap-2 rounded-xl text-sm font-semibold transition duration-200 active:translate-y-px ${
              tab === t.key ? "bg-brand-600 text-white" : "text-muted hover:bg-brand-50 hover:text-brand-700"
            }`}
          >
            <Icon icon={t.icon} size={18} />
            {t.label}
          </button>
        ))}
      </div>

      {between}

      {TABS.map((t) => (
        <div key={t.key} role="tabpanel" id={`panel-${t.key}`} aria-labelledby={`tab-${t.key}`} hidden={tab !== t.key}>
          {panels[t.key]}
        </div>
      ))}
    </>
  );
}
