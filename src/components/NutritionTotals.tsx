type Props = {
  totals: { calories: number; protein: number; carbs: number; fat: number };
  target: number;
};

// Tổng calo so với mục tiêu + tổng đạm / tinh bột / béo trong ngày.
export function NutritionTotals({ totals, target }: Props) {
  const percent = target > 0 ? Math.round((totals.calories / target) * 100) : 0;
  return (
    <section className="rounded-3xl bg-brand-600 p-5 text-white">
      <h3 className="text-sm font-semibold text-brand-50">Tổng trong ngày</h3>
      <p className="mt-1 text-3xl font-bold">
        {totals.calories} <span className="text-base font-medium text-brand-50">/ {target} kcal</span>
      </p>
      <div
        className="mt-3 h-2 overflow-hidden rounded-full bg-white/25"
        role="progressbar"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={Math.min(percent, 100)}
        aria-label="Tỉ lệ calo so với mục tiêu"
      >
        <div className="h-full origin-left rounded-full bg-white transition-transform duration-300 ease-out" style={{ transform: `scaleX(${Math.min(percent, 100) / 100})` }} />
      </div>
      <p className="mt-1 text-xs text-brand-50">Đạt {percent}% mục tiêu</p>
      <dl className="mt-4 grid grid-cols-3 gap-2 text-center">
        {[
          { label: "Đạm", value: totals.protein },
          { label: "Tinh bột", value: totals.carbs },
          { label: "Béo", value: totals.fat },
        ].map((n) => (
          <div key={n.label} className="rounded-2xl bg-white/15 p-3">
            <dt className="text-xs text-brand-50">{n.label}</dt>
            <dd className="font-bold">{n.value} g</dd>
          </div>
        ))}
      </dl>
    </section>
  );
}
