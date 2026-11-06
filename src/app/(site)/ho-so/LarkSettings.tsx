"use client";

import { useState, useTransition } from "react";

import { Icon, Icons } from "@/components/icons";
import { TextField } from "@/components/form";
import { buttonClass, Notice, PendingDots } from "@/components/ui";

import { removeLark, saveLarkSettings, sendLarkTest, type LarkResult } from "./lark-actions";

export type LarkInitial = { connected: boolean; enabled: boolean; water: boolean; move: boolean; meal: boolean; calorie: boolean };

const TOGGLES = [
  { key: "water", label: "Nhắc uống nước", hint: "7 lần mỗi ngày, từ 8:00 đến 20:00" },
  { key: "move", label: "Nhắc vận động", hint: "9:30, 15:30 và 17:30" },
  { key: "meal", label: "Nhắc giờ ăn", hint: "Sáng 7:00, trưa 11:30, tối 18:30" },
  { key: "calorie", label: "Cảnh báo quá calo", hint: "Báo ngay khi bạn ghi món làm vượt mức calo trong ngày" },
] as const;

export function LarkSettings({ initial }: { initial: LarkInitial }) {
  const [url, setUrl] = useState("");
  const [on, setOn] = useState({ enabled: initial.enabled, water: initial.water, move: initial.move, meal: initial.meal, calorie: initial.calorie });
  const [connected, setConnected] = useState(initial.connected);
  const [pending, start] = useTransition();
  const [note, setNote] = useState<{ tone: "error" | "success"; text: string } | null>(null);

  const run = (action: () => Promise<LarkResult>, after?: (r: LarkResult) => void) => {
    setNote(null);
    start(async () => {
      try {
        const r = await action();
        setNote(r.ok ? { tone: "success", text: r.message ?? "Xong rồi." } : { tone: "error", text: r.error });
        if (r.ok) after?.(r);
      } catch {
        setNote({ tone: "error", text: "Có thể mạng đang chậm hoặc bị ngắt. Bạn đợi một chút rồi thử lại nhé." });
      }
    });
  };

  return (
    <div className="space-y-4">
      {!connected && (
        <ol className="list-decimal space-y-1 pl-5 text-sm leading-relaxed text-ink">
          <li>Trong Lark, tạo một nhóm chỉ có mình bạn (hoặc nhóm bạn muốn nhận nhắc).</li>
          <li>Vào Cài đặt nhóm → Bot → Thêm bot → chọn <b>Custom Bot</b>, đặt tên bất kỳ.</li>
          <li>Copy <b>Webhook URL</b> rồi dán vào ô bên dưới. Phần bảo mật: chọn từ khoá <b>Glow up</b> hoặc để trống; không bật giới hạn IP và không bật ký xác thực.</li>
        </ol>
      )}

      <TextField
        label={connected ? "Đổi link webhook (để trống nếu giữ nguyên)" : "Link webhook của bot Lark"}
        type="password"
        autoComplete="off"
        inputMode="url"
        placeholder={connected ? "Đã kết nối — link được ẩn" : "https://open.larksuite.com/open-apis/bot/v2/hook/…"}
        value={url}
        onChange={(e) => setUrl(e.target.value)}
        hint="Link này là bí mật, ai có link đều gửi được tin vào nhóm của bạn. Đừng chia sẻ cho người khác."
      />

      <ul className="space-y-2" aria-label="Loại nhắc nhở">
        {TOGGLES.map((t) => (
          <li key={t.key}>
            <button
              type="button"
              role="switch"
              aria-checked={on[t.key]}
              onClick={() => setOn((p) => ({ ...p, [t.key]: !p[t.key] }))}
              className={`flex min-h-14 w-full items-center gap-3 rounded-2xl border-[1.5px] px-4 py-2 text-left transition duration-200 active:translate-y-px ${
                on[t.key] ? "border-brand-600 bg-brand-50" : "border-line bg-white hover:border-brand-300"
              }`}
            >
              <span className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-lg border-[1.5px] ${on[t.key] ? "border-brand-600 bg-brand-600 text-white" : "border-line bg-white"}`}>
                {on[t.key] && <Icon icon={Icons.check} size={16} />}
              </span>
              <span className="min-w-0 flex-1">
                <span className="block font-semibold text-ink">{t.label}</span>
                <span className="block text-sm text-muted">{t.hint}</span>
              </span>
            </button>
          </li>
        ))}
      </ul>

      {note && <Notice tone={note.tone}>{note.text}</Notice>}

      <div className="flex flex-col gap-2 sm:flex-row">
        <button
          type="button"
          disabled={pending}
          className={buttonClass("primary", "md", "w-full sm:w-auto")}
          onClick={() =>
            run(
              () => saveLarkSettings({ webhookUrl: url, enabled: true, water: on.water, move: on.move, meal: on.meal, calorie: on.calorie }),
              () => {
                setConnected(true);
                setOn((p) => ({ ...p, enabled: true }));
                setUrl("");
              },
            )
          }
        >
          {pending ? <>Đang lưu<PendingDots /></> : connected ? "Lưu cài đặt" : "Kết nối Lark"}
        </button>
        {connected && (
          <>
            <button type="button" disabled={pending} className={buttonClass("secondary", "md", "w-full sm:w-auto")} onClick={() => run(() => sendLarkTest())}>
              Gửi tin thử
            </button>
            <button
              type="button"
              disabled={pending}
              className={buttonClass("ghost", "md", "w-full text-muted sm:w-auto")}
              onClick={() => {
                if (window.confirm("Ngắt kết nối Lark và xoá link webhook đã lưu?")) run(() => removeLark(), () => setConnected(false));
              }}
            >
              Ngắt kết nối
            </button>
          </>
        )}
      </div>
      <p className="text-xs leading-relaxed text-muted">Nhắc nhở chỉ mang tính gợi ý, không thay cho tư vấn của bác sĩ. Giờ nhắc theo giờ Việt Nam.</p>
    </div>
  );
}
