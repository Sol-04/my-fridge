import Link from "next/link";

import { ButtonLink, EmptyState, Notice } from "@/components/ui";
import type { MealEntry } from "@/lib/meal-plan";
import { Icon, Icons } from "@/components/icons";

export type SavedPlanRow = {
  id: string;
  created_at: string;
  target_calories: number;
  breakfast: MealEntry | null;
  lunch: MealEntry | null;
  dinner: MealEntry | null;
};

// Danh sách thực đơn đã lưu của người dùng
export function SavedPlansList({ plans }: { plans: SavedPlanRow[] | null }) {
  if (plans === null) {
    return <Notice tone="error" title="Chưa tải được danh sách thực đơn">Có thể mạng đang chậm. Bạn tải lại trang sau ít phút nhé.</Notice>;
  }
  if (plans.length === 0) {
    return (
      <EmptyState icon={Icons.plan} title="Bạn chưa lưu thực đơn nào" action={<ButtonLink href="/tao-thuc-don">Tạo thực đơn</ButtonLink>}>
        Tạo thực đơn rồi bấm “Lưu thực đơn”, danh sách sẽ hiện ở đây để bạn xem lại bất cứ lúc nào.
      </EmptyState>
    );
  }
  return (
    <ul className="space-y-3">
      {plans.map((p) => {
        const total = [p.breakfast, p.lunch, p.dinner].reduce((s, m) => s + (m?.total_calories ?? 0), 0);
        const dishes = [p.breakfast, p.lunch, p.dinner].filter(Boolean).map((m) => m!.name);
        const date = new Date(p.created_at).toLocaleDateString("vi-VN", {
          day: "2-digit",
          month: "2-digit",
          year: "numeric",
          timeZone: "Asia/Ho_Chi_Minh",
        });
        return (
          <li key={p.id}>
            <Link
              href={`/thuc-don/${p.id}`}
              className="block rounded-2xl border border-line bg-white p-4 transition duration-200 hover:-translate-y-0.5 hover:shadow-lift"
            >
              <div className="flex items-center justify-between gap-2">
                <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-brand-700">
                  <Icon icon={Icons.calendar} size={16} />
                  {date}
                </span>
                <span className="inline-flex items-center gap-1 rounded-lg bg-accent-50 px-2 py-1 text-xs font-bold text-accent-500">
                  {total} / {p.target_calories} kcal
                </span>
              </div>
              <p className="mt-2 line-clamp-2 text-sm text-ink">{dishes.join(" · ") || "Không có món"}</p>
              <span className="mt-2 inline-block text-sm font-semibold text-brand-700">Xem thực đơn →</span>
            </Link>
          </li>
        );
      })}
    </ul>
  );
}
