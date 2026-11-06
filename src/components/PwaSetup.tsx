"use client";

import { useEffect, useState } from "react";

import { Icon, Icons } from "@/components/icons";
import { buttonClass } from "@/components/ui";

type InstallEvent = Event & { prompt: () => Promise<void>; userChoice: Promise<{ outcome: string }> };
const DISMISS_KEY = "glowup-install-dismissed";

// Đăng ký service worker + hiện gợi ý "Cài ứng dụng" (Android: nút cài; iPhone: hướng dẫn Chia sẻ → Thêm vào MH chính).
export function PwaSetup() {
  const [event, setEvent] = useState<InstallEvent | null>(null);
  const [ios, setIos] = useState(false);
  const [hidden, setHidden] = useState(true);

  useEffect(() => {
    if (process.env.NODE_ENV === "production" && "serviceWorker" in navigator) {
      navigator.serviceWorker.register("/sw.js", { scope: "/" }).catch(() => {});
    }
    const standalone = window.matchMedia("(display-mode: standalone)").matches || (navigator as Navigator & { standalone?: boolean }).standalone === true;
    let dismissed = false;
    try {
      dismissed = localStorage.getItem(DISMISS_KEY) === "1";
    } catch {}
    if (standalone || dismissed) return;

    const isIos = /iphone|ipad|ipod/i.test(navigator.userAgent) && !/crios|fxios/i.test(navigator.userAgent);
    // setState trong sự kiện/hẹn giờ để tránh cập nhật đồng bộ trong effect
    const t = window.setTimeout(() => {
      setIos(isIos);
      if (isIos) setHidden(false);
    }, 0);
    const onPrompt = (e: Event) => {
      e.preventDefault();
      setEvent(e as InstallEvent);
      setHidden(false);
    };
    const onInstalled = () => setHidden(true);
    window.addEventListener("beforeinstallprompt", onPrompt);
    window.addEventListener("appinstalled", onInstalled);
    return () => {
      window.clearTimeout(t);
      window.removeEventListener("beforeinstallprompt", onPrompt);
      window.removeEventListener("appinstalled", onInstalled);
    };
  }, []);

  if (hidden || (!event && !ios)) return null;

  const close = () => {
    setHidden(true);
    try {
      localStorage.setItem(DISMISS_KEY, "1");
    } catch {}
  };

  return (
    <div className="fixed inset-x-0 bottom-0 z-[200] mx-auto w-full max-w-2xl px-4 pb-[max(0.75rem,env(safe-area-inset-bottom))]">
      <div className="animate-enter flex gap-3 rounded-2xl border border-brand-200 bg-white p-4 text-sm shadow-soft" role="region" aria-label="Cài ứng dụng">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand-600 text-white">
          <Icon icon={Icons.logo} size={20} />
        </span>
        <div className="min-w-0 flex-1">
          <p className="font-bold text-ink">Cài Glow up with me lên điện thoại</p>
          {event ? (
            <p className="mt-0.5 text-muted">Mở nhanh từ màn hình chính, chạy toàn màn hình như một ứng dụng.</p>
          ) : (
            <p className="mt-0.5 text-muted">
              Trong Safari, chạm nút <b>Chia sẻ</b> rồi chọn <b>Thêm vào MH chính</b> (Thêm vào Màn hình chính).
            </p>
          )}
          <div className="mt-3 flex flex-wrap gap-2">
            {event && (
              <button
                type="button"
                className={buttonClass("primary", "md", "min-h-11")}
                onClick={async () => {
                  await event.prompt();
                  setEvent(null);
                  setHidden(true);
                }}
              >
                Cài ứng dụng
              </button>
            )}
            <button type="button" className={buttonClass("ghost", "md", "min-h-11")} onClick={close}>
              Để sau
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
