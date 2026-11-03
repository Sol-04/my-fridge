type Props = {
  totals: { calories: number; protein: number; carbs: number; fat: number };
  target: number;
};

// Tổng calo so với mục tiêu + tổng đạm / tinh bột / béo trong ngày.
export function NutritionTotals({ totals, target }: Props) {
  const percent = target > 0 ? Math.round((totals.calories / target) * 100) : 0;
  return (
    <section className="rounded-2xl bg-emerald-50 p-4 dark:bg-emerald-950">
      <h3 className="text-sm font-semibold text-emerald-800 dark:text-emerald-300">Tổng trong ngày</h3>
      <p className="mt-1 text-2xl font-bold text-zinc-900 dark:text-zinc-100">
        {totals.calories} <span className="text-base font-normal text-zinc-600 dark:text-zinc-400">/ {target} kcal</span>
      </p>
      <div
        className="mt-2 h-2 overflow-hidden rounded-full bg-emerald-100 dark:bg-emerald-900"
        role="progressbar"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={Math.min(percent, 100)}
        aria-label="Tỉ lệ calo so với mục tiêu"
      >
        <div className="h-full rounded-full bg-emerald-600" style={{ width: `${Math.min(percent, 100)}%` }} />
      </div>
      <p className="mt-1 text-xs text-zinc-600 dark:text-zinc-400">{percent}% mục tiêu</p>
      <dl className="mt-3 grid grid-cols-3 gap-2 text-center">
        {[
          { label: "Đạm", value: totals.protein },
          { label: "Tinh bột", value: totals.carbs },
          { label: "Béo", value: totals.fat },
        ].map((n) => (
          <div key={n.label} className="rounded-xl bg-white p-2 dark:bg-zinc-900">
            <dt className="text-xs text-zinc-500">{n.label}</dt>
            <dd className="font-semibold text-zinc-900 dark:text-zinc-100">{n.value} g</dd>
          </div>
        ))}
      </dl>
    </section>
  );
}
