// Tính chu kỳ kinh nguyệt từ các kỳ đã ghi (chạy được cả ở máy chủ lẫn trình duyệt). Chỉ là ước tính tham khảo.
const dayMs = 86_400_000;
const isoDay = (ms: number) => new Date(ms).toISOString().slice(0, 10);
export const dayNumber = (iso: string) => Math.floor(Date.parse(`${iso}T00:00:00Z`) / dayMs);

export type CycleStats = {
  lastStart: string | null;
  avgCycleDays: number | null; // trung bình các khoảng cách giữa 2 kỳ liên tiếp
  avgPeriodDays: number | null;
  nextStart: string | null; // dự đoán, chỉ mang tính tham khảo
};

export function cycleStats(starts: { start: string; end: string | null }[]): CycleStats {
  const sorted = [...starts].sort((a, b) => a.start.localeCompare(b.start));
  if (sorted.length === 0) return { lastStart: null, avgCycleDays: null, avgPeriodDays: null, nextStart: null };
  const last = sorted[sorted.length - 1];
  // Chỉ dùng tối đa 6 khoảng gần nhất; bỏ khoảng bất thường (<15 hoặc >60 ngày) do thiếu dữ liệu
  const gaps: number[] = [];
  for (let i = 1; i < sorted.length; i++) gaps.push(dayNumber(sorted[i].start) - dayNumber(sorted[i - 1].start));
  const good = gaps.slice(-6).filter((g) => g >= 15 && g <= 60);
  const avgCycle = good.length ? Math.round(good.reduce((s, g) => s + g, 0) / good.length) : null;
  const lens = sorted.slice(-6).filter((p) => p.end).map((p) => dayNumber(p.end!) - dayNumber(p.start) + 1);
  const avgPeriod = lens.length ? Math.round(lens.reduce((s, g) => s + g, 0) / lens.length) : null;
  let nextNum = avgCycle ? dayNumber(last.start) + avgCycle : null;
  const todayNum = Math.floor(Date.now() / dayMs);
  while (nextNum != null && avgCycle && nextNum < todayNum) nextNum += avgCycle; // quá hạn thì dự đoán kỳ kế tiếp
  const next = nextNum != null ? isoDay(nextNum * dayMs) : null;
  return { lastStart: last.start, avgCycleDays: avgCycle, avgPeriodDays: avgPeriod, nextStart: next };
}
