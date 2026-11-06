"use client";

import { useRef, useState } from "react";

import { Icon, Icons } from "@/components/icons";
import { buttonClass, cardClass, Notice, PendingDots } from "@/components/ui";
import { readAppleHealthFile } from "@/lib/apple-health";
import { cycleStats } from "@/lib/cycle";
import { addDays, formatDiaryDate } from "@/lib/diary";
import type { CycleRow, HealthDayRow } from "@/lib/health-db";

import { addCycleStart, deleteAllHealthData, deleteCycle, importHealthSummary } from "./health-actions";
import { selectClass, useDiaryRun } from "./useDiaryRun";

const SHORT_DAY = ["CN", "T2", "T3", "T4", "T5", "T6", "T7"];
const nf = new Intl.NumberFormat("vi-VN");
const shortDate = (iso: string) => iso.slice(8, 10) + "/" + iso.slice(5, 7);
const weekdayShort = (iso: string) => SHORT_DAY[new Date(`${iso}T00:00:00Z`).getUTCDay()];

type Props = { date: string; today: string; week: HealthDayRow[]; cycles: CycleRow[] };

export function HealthTab({ date, today, week, cycles }: Props) {
  const { pending, error, setError, run } = useDiaryRun();
  const fileRef = useRef<HTMLInputElement>(null);
  const [reading, setReading] = useState<number | null>(null); // % đã đọc file
  const [message, setMessage] = useState<string | null>(null);
  const [cycleDate, setCycleDate] = useState(today);

  const byDay = new Map(week.map((d) => [d.day, d]));
  const days = Array.from({ length: 7 }, (_, i) => addDays(date, i - 6));
  const maxSteps = Math.max(1000, ...week.map((d) => d.steps ?? 0));
  const current = byDay.get(date);
  const stats = cycleStats(cycles.map((c) => ({ start: c.start_date, end: c.end_date })));
  const hasData = week.length > 0 || cycles.length > 0;
  const busy = pending || reading !== null;

  async function onFile(file: File | undefined) {
    if (!file) return;
    setError(null);
    setMessage(null);
    setReading(0);
    try {
      const summary = await readAppleHealthFile(file, setReading);
      setReading(null);
      run(
        () => importHealthSummary({ days: summary.days, cycles: summary.cycles }),
        () => setMessage(`Đã lưu ${summary.days.length} ngày bước chân / năng lượng và ${summary.cycles.length} kỳ kinh nguyệt từ file của bạn.`),
      );
    } catch (err) {
      setReading(null);
      setError(
        err instanceof Error && err.message === "NO_EXPORT_XML"
          ? "Trong file zip không thấy export.xml. Bạn chọn đúng file export.zip xuất từ app Sức khoẻ nhé."
          : "Chưa đọc được file này. Bạn chọn đúng file export.zip (hoặc export.xml) xuất từ app Sức khoẻ nhé.",
      );
    } finally {
      if (fileRef.current) fileRef.current.value = "";
    }
  }

  return (
    <div className="space-y-5">
      {/* Hôm nay */}
      <section className={`${cardClass} animate-enter p-5`} aria-label="Bước chân và năng lượng hoạt động">
        <h2 className="flex items-center gap-2 text-xl font-bold text-ink">
          <Icon icon={Icons.steps} size={20} /> {date === today ? "Hôm nay" : formatDiaryDate(date)}
        </h2>
        {current ? (
          <dl className="mt-4 grid grid-cols-2 gap-3 text-center">
            <div className="rounded-2xl bg-aqua-50 p-4">
              <dt className="text-sm text-muted">Bước chân</dt>
              <dd className="mt-1 text-2xl font-bold text-ink">{current.steps != null ? nf.format(current.steps) : "—"}</dd>
            </div>
            <div className="rounded-2xl bg-accent-50 p-4">
              <dt className="text-sm text-muted">Năng lượng hoạt động</dt>
              <dd className="mt-1 text-2xl font-bold text-accent-500">{current.active_kcal != null ? `${nf.format(current.active_kcal)} kcal` : "—"}</dd>
            </div>
          </dl>
        ) : (
          <p className="mt-3 text-sm text-muted">Chưa có số liệu cho ngày này. Nhập file từ app Sức khoẻ ở bên dưới để thấy bước chân và năng lượng hoạt động.</p>
        )}

        {week.length > 0 && (
          <div className="mt-5">
            <p className="text-sm font-semibold text-ink">Bước chân 7 ngày gần nhất</p>
            <ul className="mt-3 flex h-28 items-end gap-2" aria-label="Biểu đồ bước chân 7 ngày">
              {days.map((d) => {
                const steps = byDay.get(d)?.steps ?? 0;
                return (
                  <li key={d} className="flex h-full min-w-0 flex-1 flex-col items-center justify-end gap-1" title={`${shortDate(d)}: ${nf.format(steps)} bước`}>
                    <div className={`w-full rounded-lg ${d === date ? "bg-brand-600" : "bg-brand-200"}`} style={{ height: `${Math.max(4, (steps / maxSteps) * 100)}%` }} />
                    <span className="text-xs text-muted">{weekdayShort(d)}</span>
                  </li>
                );
              })}
            </ul>
          </div>
        )}
      </section>

      {/* Nhập file */}
      <section className={`${cardClass} animate-enter p-5`} aria-label="Nhập dữ liệu từ Apple Sức khoẻ">
        <h2 className="flex items-center gap-2 text-xl font-bold text-ink">
          <Icon icon={Icons.heartbeat} size={20} /> Lấy dữ liệu từ app Sức khoẻ (iPhone)
        </h2>
        <ol className="mt-3 list-decimal space-y-1 pl-5 text-sm leading-relaxed text-ink">
          <li>Mở app <b>Sức khoẻ</b> trên iPhone, chạm vào ảnh hồ sơ ở góc trên bên phải.</li>
          <li>Kéo xuống, chạm <b>Xuất tất cả dữ liệu sức khoẻ</b>, chờ máy nén xong rồi lưu file <b>export.zip</b> vào app Tệp.</li>
          <li>Quay lại đây, bấm nút bên dưới và chọn file đó.</li>
        </ol>
        <input ref={fileRef} type="file" accept=".zip,.xml,application/zip,text/xml" className="sr-only" id="health-file" disabled={busy} onChange={(e) => onFile(e.target.files?.[0])} />
        <label
          htmlFor="health-file"
          className={buttonClass("primary", "md", `mt-4 w-full cursor-pointer sm:w-auto ${busy ? "pointer-events-none opacity-60" : ""}`)}
        >
          <Icon icon={Icons.upload} size={18} />
          {reading !== null ? `Đang đọc file… ${reading}%` : pending ? <>Đang lưu<PendingDots /></> : "Chọn file export.zip"}
        </label>
        {reading !== null && (
          <div className="mt-3 h-2 overflow-hidden rounded-full bg-brand-100" role="progressbar" aria-valuenow={reading} aria-valuemin={0} aria-valuemax={100}>
            <div className="h-full origin-left rounded-full bg-brand-600" style={{ transform: `scaleX(${reading / 100})` }} />
          </div>
        )}
        <p className="mt-3 text-xs leading-relaxed text-muted">
          File được đọc ngay trên điện thoại của bạn, web không tải file gốc lên. Chỉ lưu số bước chân, năng lượng hoạt động mỗi ngày và các kỳ kinh nguyệt. File lớn có thể mất vài phút. Muốn cập nhật số mới, bạn xuất và chọn lại file.
        </p>
        {error && <div className="mt-3"><Notice tone="error">{error}</Notice></div>}
        {message && <div className="mt-3"><Notice tone="success">{message}</Notice></div>}
      </section>

      {/* Chu kỳ */}
      <section className={`${cardClass} animate-enter p-5`} aria-label="Chu kỳ kinh nguyệt">
        <h2 className="flex items-center gap-2 text-xl font-bold text-ink">
          <Icon icon={Icons.cycle} size={20} /> Chu kỳ kinh nguyệt
        </h2>
        {stats.lastStart ? (
          <dl className="mt-4 grid grid-cols-2 gap-3 text-center">
            <div className="rounded-2xl bg-aqua-50 p-4">
              <dt className="text-sm text-muted">Kỳ gần nhất bắt đầu</dt>
              <dd className="mt-1 text-lg font-bold text-ink">{formatDiaryDate(stats.lastStart)}</dd>
            </div>
            <div className="rounded-2xl bg-aqua-50 p-4">
              <dt className="text-sm text-muted">Chu kỳ trung bình</dt>
              <dd className="mt-1 text-lg font-bold text-ink">{stats.avgCycleDays ? `${stats.avgCycleDays} ngày` : "Chưa đủ dữ liệu"}</dd>
            </div>
            {stats.nextStart && (
              <div className="col-span-2 rounded-2xl bg-aqua-50 p-4">
                <dt className="text-sm text-muted">Dự kiến kỳ tiếp theo (chỉ để tham khảo)</dt>
                <dd className="mt-1 text-lg font-bold text-ink">{formatDiaryDate(stats.nextStart)}</dd>
              </div>
            )}
          </dl>
        ) : (
          <p className="mt-3 text-sm text-muted">Chưa có kỳ nào. Bạn nhập file từ app Sức khoẻ hoặc tự thêm ngày bắt đầu bên dưới.</p>
        )}

        <form
          className="mt-4 flex flex-col gap-2 sm:flex-row sm:items-end"
          onSubmit={(e) => {
            e.preventDefault();
            run(() => addCycleStart(cycleDate));
          }}
        >
          <label className="block flex-1 text-sm font-medium text-ink">
            Ngày bắt đầu kỳ mới
            <input type="date" className={`${selectClass} mt-1`} value={cycleDate} max={today} min="2020-01-01" onChange={(e) => setCycleDate(e.target.value)} required disabled={busy} />
          </label>
          <button type="submit" disabled={busy} className={buttonClass("secondary", "md", "w-full sm:w-auto")}>
            <Icon icon={Icons.add} size={18} /> Thêm kỳ
          </button>
        </form>

        {cycles.length > 0 && (
          <ul className="mt-4 space-y-2">
            {cycles.slice(0, 6).map((c) => (
              <li key={c.id} className="flex items-center gap-3 rounded-2xl border border-line px-4 py-2 text-sm">
                <span className="min-w-0 flex-1">
                  {shortDate(c.start_date)}/{c.start_date.slice(0, 4)}
                  {c.end_date && c.end_date !== c.start_date ? ` – ${shortDate(c.end_date)}` : ""}
                </span>
                <button
                  type="button"
                  disabled={busy}
                  onClick={() => run(() => deleteCycle(c.id))}
                  className="inline-flex min-h-11 min-w-11 items-center justify-center rounded-xl text-muted transition duration-200 hover:bg-brand-50 hover:text-brand-700"
                  aria-label={`Xoá kỳ bắt đầu ${shortDate(c.start_date)}`}
                >
                  <Icon icon={Icons.trash} size={18} />
                </button>
              </li>
            ))}
          </ul>
        )}
        <p className="mt-3 text-xs leading-relaxed text-muted">
          Ngày dự kiến chỉ là ước tính từ các kỳ đã ghi, không thay cho tư vấn của bác sĩ và không dùng để tránh thai. Dữ liệu này rất riêng tư: chỉ bạn xem được.
        </p>
      </section>

      {hasData && (
        <button
          type="button"
          disabled={busy}
          onClick={() => {
            if (window.confirm("Xoá toàn bộ bước chân, năng lượng hoạt động và chu kỳ đã lưu? Việc này không hoàn tác được.")) run(() => deleteAllHealthData(), () => setMessage("Đã xoá dữ liệu sức khoẻ của bạn."));
          }}
          className={buttonClass("ghost", "md", "w-full text-muted")}
        >
          <Icon icon={Icons.trash} size={18} /> Xoá toàn bộ dữ liệu sức khoẻ
        </button>
      )}
    </div>
  );
}
