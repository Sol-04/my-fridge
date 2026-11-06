// Đọc file xuất từ app Sức khoẻ của iPhone (export.zip hoặc export.xml) NGAY TRÊN MÁY người dùng.
// File gốc không được gửi đi đâu: chỉ gửi lên máy chủ phần tóm tắt (bước chân + năng lượng hoạt động mỗi ngày,
// các kỳ kinh nguyệt). Chạy ở trình duyệt, nên KHÔNG import "server-only" vào đây.
import { Unzip, UnzipInflate } from "fflate";

import { dayNumber } from "@/lib/cycle";

export type HealthDay = { day: string; steps: number | null; activeKcal: number | null };
export type CyclePeriod = { start: string; end: string };
export type HealthSummary = { days: HealthDay[]; cycles: CyclePeriod[]; recordsRead: number };

const KEEP_DAYS = 400; // chỉ giữ ~13 tháng gần nhất cho bước chân / năng lượng
const KEEP_CYCLE_DAYS = 800; // chu kỳ giữ ~2 năm để tính độ dài trung bình
const GAP_DAYS = 3; // cách nhau quá 3 ngày thì coi là kỳ mới
const MAX_PERIOD_DAYS = 15; // khớp ràng buộc trong cơ sở dữ liệu
const KJ_PER_KCAL = 4.184;

const STEP = "HKQuantityTypeIdentifierStepCount";
const ENERGY = "HKQuantityTypeIdentifierActiveEnergyBurned";
const FLOW = "HKCategoryTypeIdentifierMenstrualFlow";

const RECORD = /<Record\s[^>]*>/g;
const ATTR = /(\w+)="([^"]*)"/g;

const dayMs = 86_400_000;
const isoDay = (ms: number) => new Date(ms).toISOString().slice(0, 10);

function attrs(tag: string): Record<string, string> {
  const out: Record<string, string> = {};
  ATTR.lastIndex = 0;
  let m: RegExpExecArray | null;
  while ((m = ATTR.exec(tag))) out[m[1]] = m[2];
  return out;
}

// Gom từng đoạn chữ của file XML thành số liệu theo ngày
class Collector {
  recordsRead = 0;
  private tail = "";
  private stepsBySource = new Map<string, Map<string, number>>(); // ngày → nguồn → tổng
  private energyBySource = new Map<string, Map<string, number>>();
  private flowDays = new Set<string>();
  private minDay: string;
  private minCycleDay: string;

  constructor(now = Date.now()) {
    this.minDay = isoDay(now - KEEP_DAYS * dayMs);
    this.minCycleDay = isoDay(now - KEEP_CYCLE_DAYS * dayMs);
  }

  push(text: string) {
    const buf = this.tail + text;
    let lastEnd = 0;
    RECORD.lastIndex = 0;
    let m: RegExpExecArray | null;
    while ((m = RECORD.exec(buf))) {
      lastEnd = RECORD.lastIndex;
      const tag = m[0];
      if (tag.includes(STEP)) this.add(tag, this.stepsBySource, "step");
      else if (tag.includes(ENERGY)) this.add(tag, this.energyBySource, "energy");
      else if (tag.includes(FLOW)) this.addFlow(tag);
    }
    // Giữ lại phần chưa trọn thẻ ở cuối đoạn
    const cut = Math.max(lastEnd, buf.lastIndexOf("<"));
    this.tail = buf.slice(cut);
    if (this.tail.length > 20_000) this.tail = "";
  }

  private add(tag: string, into: Map<string, Map<string, number>>, kind: "step" | "energy") {
    const a = attrs(tag);
    const day = (a.startDate ?? "").slice(0, 10);
    if (day < this.minDay || !/^\d{4}-\d{2}-\d{2}$/.test(day)) return;
    let v = Number(a.value);
    if (!Number.isFinite(v) || v < 0) return;
    if (kind === "energy" && (a.unit ?? "kcal").toLowerCase() === "kj") v /= KJ_PER_KCAL;
    this.recordsRead++;
    const src = a.sourceName ?? "?";
    let bySrc = into.get(day);
    if (!bySrc) into.set(day, (bySrc = new Map()));
    bySrc.set(src, (bySrc.get(src) ?? 0) + v);
  }

  private addFlow(tag: string) {
    const a = attrs(tag);
    const day = (a.startDate ?? "").slice(0, 10);
    if (day < this.minCycleDay || !/^\d{4}-\d{2}-\d{2}$/.test(day)) return;
    if (/None$/.test(a.value ?? "")) return; // "không ra máu" không tính là ngày có kinh
    this.recordsRead++;
    this.flowDays.add(day);
  }

  result(): HealthSummary {
    // iPhone và Apple Watch cùng ghi bước chân → chỉ lấy nguồn nhiều nhất mỗi ngày để khỏi cộng đôi
    const best = (m: Map<string, number>) => Math.max(...m.values());
    const days = new Set([...this.stepsBySource.keys(), ...this.energyBySource.keys()]);
    const out: HealthDay[] = [...days]
      .sort()
      .map((day) => {
        const s = this.stepsBySource.get(day);
        const e = this.energyBySource.get(day);
        return { day, steps: s ? Math.round(best(s)) : null, activeKcal: e ? Math.round(best(e)) : null };
      })
      .filter((d) => (d.steps ?? 0) > 0 || (d.activeKcal ?? 0) > 0);
    return { days: out, cycles: groupPeriods([...this.flowDays]).slice(-40), recordsRead: this.recordsRead };
  }
}

// Các ngày có kinh liền nhau (cách ≤ 3 ngày) → 1 kỳ
export function groupPeriods(flowDays: string[]): CyclePeriod[] {
  const sorted = [...new Set(flowDays)].sort();
  const periods: CyclePeriod[] = [];
  for (const d of sorted) {
    const last = periods[periods.length - 1];
    if (last && dayNumber(d) - dayNumber(last.end) <= GAP_DAYS && dayNumber(d) - dayNumber(last.start) < MAX_PERIOD_DAYS) last.end = d;
    else periods.push({ start: d, end: d });
  }
  return periods;
}

const CHUNK = 4 * 1024 * 1024;

export async function readAppleHealthFile(file: File, onProgress?: (percent: number) => void): Promise<HealthSummary> {
  const collector = new Collector();
  const decoder = new TextDecoder("utf-8");
  const isZip = /\.zip$/i.test(file.name) || file.type === "application/zip";
  let foundXml = false;

  if (!isZip) {
    foundXml = true;
    for (let o = 0; o < file.size; o += CHUNK) {
      const buf = await file.slice(o, o + CHUNK).arrayBuffer();
      collector.push(decoder.decode(buf, { stream: true }));
      onProgress?.(Math.min(99, Math.round(((o + CHUNK) / file.size) * 100)));
    }
  } else {
    let failure: Error | null = null;
    const unzip = new Unzip();
    unzip.register(UnzipInflate);
    unzip.onfile = (f) => {
      const base = f.name.split("/").pop()?.toLowerCase();
      if (base !== "export.xml") return; // bỏ qua export_cda.xml, ảnh điện tâm đồ…
      foundXml = true;
      f.ondata = (err, chunk) => {
        if (err) failure = err;
        else collector.push(decoder.decode(chunk, { stream: true }));
      };
      f.start();
    };
    for (let o = 0; o < file.size; o += CHUNK) {
      const buf = new Uint8Array(await file.slice(o, o + CHUNK).arrayBuffer());
      unzip.push(buf, o + CHUNK >= file.size);
      if (failure) throw failure;
      onProgress?.(Math.min(99, Math.round(((o + CHUNK) / file.size) * 100)));
      await new Promise((r) => setTimeout(r)); // nhường màn hình cập nhật thanh tiến độ
    }
  }
  if (!foundXml) throw new Error("NO_EXPORT_XML");
  onProgress?.(100);
  return collector.result();
}
