import type { CSSProperties } from "react";

import { Icon, Icons, type LucideIcon } from "@/components/icons";
import { RecipeCard } from "@/components/RecipeCard";
import { ButtonLink } from "@/components/ui";
import { getRecipes } from "@/sanity/lib/recipes";
import { MEAL_OPTIONS } from "@/sanity/meals";

const STEPS: { icon: LucideIcon; title: string; text: string; hint: string }[] = [
  {
    icon: Icons.stepInfo,
    title: "Nhập thông tin",
    text: "Chiều cao, cân nặng, mức vận động và mục tiêu. Web tự tính lượng calo bạn cần mỗi ngày.",
    hint: "Khoảng 20 giây",
  },
  {
    icon: Icons.stepFoods,
    title: "Chọn đồ đang có",
    text: "Chạm chọn thực phẩm trong tủ lạnh: trứng, ức gà, đậu phụ, rau cải… Gia vị đã tính sẵn.",
    hint: "Chọn càng nhiều, gợi ý càng hợp",
  },
  {
    icon: Icons.stepMenu,
    title: "Nhận thực đơn",
    text: "Gợi ý món sáng – trưa – tối với khẩu phần vừa đủ calo. Đăng nhập để lưu lại và gửi link cho người thân.",
    hint: "Đổi món bất cứ lúc nào",
  },
];

const FRIDGE_ITEMS: { icon: LucideIcon; label: string }[] = [
  { icon: Icons.egg, label: "Trứng" },
  { icon: Icons.chicken, label: "Ức gà" },
  { icon: Icons.greens, label: "Cải ngọt" },
  { icon: Icons.stepFoods, label: "Cà rốt" },
  { icon: Icons.grain, label: "Gạo lứt" },
  { icon: Icons.milk, label: "Sữa chua" },
];

const SAMPLE_MENU: { icon: LucideIcon; meal: string; dish: string; kcal: number }[] = [
  { icon: Icons.breakfast, meal: "Sáng", dish: "Trứng cuộn rau củ", kcal: 332 },
  { icon: Icons.lunch, meal: "Trưa", dish: "Cơm gạo lứt ức gà", kcal: 486 },
  { icon: Icons.dinner, meal: "Tối", dish: "Canh đậu phụ cà chua", kcal: 388 },
];

const SECTION_Y = "py-[clamp(3.5rem,8vw,8rem)]";
const stagger = (i: number) => ({ "--i": i }) as CSSProperties;

// Sóng nền mảnh, đơn sắc, đứng yên — trang trí nhẹ cho phần mở đầu
function Waves() {
  return (
    <svg
      aria-hidden
      className="pointer-events-none absolute inset-x-0 bottom-0 h-40 w-full sm:h-56"
      viewBox="0 0 1440 240"
      preserveAspectRatio="none"
    >
      <path d="M0 150 C 240 110 480 190 720 150 S 1200 110 1440 150 L1440 240 L0 240 Z" fill="var(--color-lavender)" opacity="0.55" />
      <path d="M0 185 C 260 150 520 220 760 185 S 1220 155 1440 190 L1440 240 L0 240 Z" fill="var(--color-aqua-100)" opacity="0.8" />
      <path d="M0 215 C 300 195 560 240 820 215 S 1240 200 1440 220 L1440 240 L0 240 Z" fill="var(--color-canvas)" />
    </svg>
  );
}

export default async function Home() {
  const recipes = await getRecipes();
  // Món nổi bật: mỗi bữa lấy 1 món
  const featured = MEAL_OPTIONS.map((m) => recipes.find((r) => r.meals?.includes(m.value))).filter(
    (r): r is NonNullable<typeof r> => Boolean(r),
  );

  return (
    <main>
      {/* ---------- Phần mở đầu: chữ trái, minh hoạ phải ---------- */}
      <section className="relative overflow-hidden bg-white">
        <Waves />
        <div className="relative mx-auto grid w-full max-w-5xl gap-10 px-4 pt-10 pb-24 sm:px-6 sm:pt-20 sm:pb-40 md:grid-cols-[1.15fr_1fr] md:items-center">
          <div className="animate-enter">
            <p className="inline-flex items-center gap-2 rounded-lg bg-aqua-50 px-3 py-1.5 text-sm font-semibold text-aqua-800">
              <Icon icon={Icons.sparkles} size={16} />
              Miễn phí · Xem gợi ý không cần đăng ký
            </p>
            <h1 className="mt-5 text-[clamp(2.5rem,5vw,4rem)] leading-[1.1] font-bold tracking-tight text-ink">
              Có sẵn đồ trong tủ lạnh mà <span className="text-brand-600">không biết nấu gì?</span>
            </h1>
            <p className="mt-5 max-w-[60ch] text-lg text-muted">
              Chọn thực phẩm bạn đang có, My Fridge gợi ý ngay thực đơn sáng – trưa – tối{" "}
              <strong className="font-semibold text-ink">vừa đủ calo</strong> để bạn ăn ngon mà vẫn giữ dáng.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <ButtonLink href="/tao-thuc-don" size="lg">
                Tạo thực đơn miễn phí
                <Icon icon={Icons.next} size={20} />
              </ButtonLink>
              <ButtonLink href="/mon-an" size="lg" variant="secondary">
                Xem món ăn
              </ButtonLink>
            </div>
            <p className="mt-4 text-sm text-muted">
              Chỉ mất khoảng 1 phút · {recipes.length || "Nhiều"} món Việt dễ nấu
            </p>
          </div>

          {/* Minh hoạ: tủ lạnh → thực đơn */}
          <div aria-hidden className="animate-enter mx-auto w-full max-w-sm [animation-delay:120ms]">
            <div className="rounded-3xl border border-line bg-white p-5 shadow-soft">
              <p className="text-sm font-semibold text-muted">Trong tủ lạnh có…</p>
              <div className="mt-3 flex flex-wrap gap-2">
                {FRIDGE_ITEMS.map((i) => (
                  <span
                    key={i.label}
                    className="inline-flex items-center gap-1.5 rounded-lg bg-brand-50 px-2.5 py-1.5 text-sm font-medium text-brand-800"
                  >
                    <Icon icon={i.icon} size={16} />
                    {i.label}
                  </span>
                ))}
              </div>
              <div className="my-4 flex items-center gap-2 text-brand-400">
                <span className="h-px flex-1 bg-line" />
                <Icon icon={Icons.down} size={18} />
                <span className="h-px flex-1 bg-line" />
              </div>
              <ul className="space-y-2 text-sm">
                {SAMPLE_MENU.map((m) => (
                  <li key={m.meal} className="flex items-center gap-3 rounded-2xl bg-canvas px-3 py-2.5">
                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white text-aqua-800">
                      <Icon icon={m.icon} size={16} />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block text-xs text-muted">{m.meal}</span>
                      <span className="block truncate font-semibold text-ink">{m.dish}</span>
                    </span>
                    <span className="shrink-0 font-semibold text-accent-500">{m.kcal} kcal</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* ---------- 3 bước: bố cục so le ---------- */}
      <section aria-labelledby="cach-hoat-dong" className={SECTION_Y}>
        <div className="mx-auto w-full max-w-5xl px-4 sm:px-6">
          <div className="max-w-xl">
            <p className="text-sm font-semibold tracking-wide text-brand-600">Cách hoạt động</p>
            <h2 id="cach-hoat-dong" className="mt-1 text-[1.75rem] leading-tight font-bold tracking-tight text-ink sm:text-4xl">
              3 bước để có thực đơn cả ngày
            </h2>
          </div>
          <ol className="stagger mt-10 space-y-6 sm:space-y-10">
            {STEPS.map((s, i) => (
              <li
                key={s.title}
                style={stagger(i)}
                className={`flex flex-col gap-5 sm:items-center sm:gap-10 ${i % 2 ? "sm:flex-row-reverse" : "sm:flex-row"}`}
              >
                <div className="flex h-28 w-full shrink-0 items-center justify-center rounded-3xl bg-aqua-50 text-aqua-800 sm:h-44 sm:w-[44%]">
                  <Icon icon={s.icon} size={56} strokeWidth={1.25} />
                </div>
                <div className="sm:flex-1">
                  <p className="text-sm font-semibold text-brand-600">Bước {i + 1}</p>
                  <h3 className="mt-1 text-2xl font-bold text-ink">{s.title}</h3>
                  <p className="mt-2 max-w-[60ch] text-muted">{s.text}</p>
                  <p className="mt-3 inline-flex items-center gap-1.5 rounded-lg bg-white px-2.5 py-1 text-sm font-medium text-brand-700 shadow-soft">
                    <Icon icon={Icons.check} size={16} />
                    {s.hint}
                  </p>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* ---------- Món nổi bật ---------- */}
      {featured.length > 0 && (
        <section aria-labelledby="mon-noi-bat" className={`bg-white ${SECTION_Y}`}>
          <div className="mx-auto w-full max-w-5xl px-4 sm:px-6">
            <div className="flex items-end justify-between gap-4">
              <div>
                <p className="text-sm font-semibold tracking-wide text-brand-600">Gợi ý hôm nay</p>
                <h2 id="mon-noi-bat" className="mt-1 text-[1.75rem] leading-tight font-bold tracking-tight text-ink sm:text-4xl">
                  Món nổi bật
                </h2>
              </div>
              <div className="hidden sm:block">
                <ButtonLink href="/mon-an" variant="ghost">
                  Xem tất cả
                  <Icon icon={Icons.next} size={18} />
                </ButtonLink>
              </div>
            </div>
            <ul className="stagger mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {featured.map((r, i) => (
                <li key={r._id} style={stagger(i)}>
                  <RecipeCard recipe={r} />
                </li>
              ))}
            </ul>
            <ButtonLink href="/mon-an" variant="secondary" className="mt-6 w-full sm:hidden">
              Xem tất cả món ăn
            </ButtonLink>
          </div>
        </section>
      )}

      {/* ---------- Kêu gọi cuối trang ---------- */}
      <section className={`px-4 sm:px-6 ${SECTION_Y}`}>
        <div className="mx-auto w-full max-w-5xl rounded-3xl bg-brand-600 px-6 py-12 text-center text-white sm:py-16">
          <h2 className="text-[1.75rem] leading-tight font-bold tracking-tight sm:text-4xl">Hôm nay ăn gì? Để My Fridge lo!</h2>
          <p className="mx-auto mt-3 max-w-md text-brand-50">
            Tận dụng đồ có sẵn, bớt lãng phí, ăn vừa đủ calo mỗi ngày.
          </p>
          <ButtonLink href="/tao-thuc-don" size="lg" variant="light" className="mt-7 w-full sm:w-auto">
            Tạo thực đơn miễn phí
          </ButtonLink>
        </div>
      </section>
    </main>
  );
}
