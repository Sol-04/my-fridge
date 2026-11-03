import { RecipeCard } from "@/components/RecipeCard";
import { ButtonLink } from "@/components/ui";
import { getRecipes } from "@/sanity/lib/recipes";
import { MEAL_OPTIONS } from "@/sanity/meals";

const STEPS = [
  {
    icon: "📝",
    title: "Nhập thông tin",
    text: "Chiều cao, cân nặng, mức vận động và mục tiêu. Web tự tính lượng calo bạn cần mỗi ngày.",
  },
  {
    icon: "🥕",
    title: "Chọn đồ đang có",
    text: "Chạm chọn thực phẩm trong tủ lạnh: trứng, ức gà, đậu phụ, rau cải… Gia vị đã tính sẵn.",
  },
  {
    icon: "🍱",
    title: "Nhận thực đơn",
    text: "Gợi ý món sáng – trưa – tối với khẩu phần vừa đủ calo. Lưu lại và gửi link cho người thân.",
  },
];

const FRIDGE_ITEMS = ["🥚 Trứng", "🍗 Ức gà", "🥬 Cải ngọt", "🍅 Cà chua", "🍠 Khoai lang", "🧈 Đậu phụ"];

export default async function Home() {
  const recipes = await getRecipes();
  // Món nổi bật: mỗi bữa lấy 1 món
  const featured = MEAL_OPTIONS.map((m) => recipes.find((r) => r.meals?.includes(m.value))).filter(
    (r): r is NonNullable<typeof r> => Boolean(r),
  );

  return (
    <main>
      {/* ---------- Phần mở đầu ---------- */}
      <section className="relative overflow-hidden">
        <div
          aria-hidden
          className="pointer-events-none absolute -top-24 right-[-6rem] h-72 w-72 rounded-full bg-brand-100 blur-3xl"
        />
        <div className="relative mx-auto grid w-full max-w-5xl gap-10 px-4 pt-10 pb-12 sm:pt-16 md:grid-cols-[1.15fr_1fr] md:items-center">
          <div>
            <p className="inline-flex items-center gap-2 rounded-full bg-white px-3 py-1 text-sm font-medium text-brand-700 shadow-sm ring-1 ring-brand-100">
              <span aria-hidden>✨</span> Miễn phí · Không cần đăng ký
            </p>
            <h1 className="mt-4 text-[2rem] leading-tight font-extrabold tracking-tight text-ink sm:text-5xl">
              Có sẵn đồ trong tủ lạnh mà <span className="text-brand-600">không biết nấu gì?</span>
            </h1>
            <p className="mt-4 max-w-lg text-lg leading-relaxed text-muted">
              Chọn thực phẩm bạn đang có, My Fridge gợi ý ngay thực đơn sáng – trưa – tối{" "}
              <strong className="font-semibold text-ink">vừa đủ calo</strong> để bạn ăn ngon mà vẫn giữ dáng.
            </p>
            <div className="mt-7 flex flex-col gap-3 sm:flex-row">
              <ButtonLink href="/tao-thuc-don" size="lg">
                Tạo thực đơn miễn phí <span aria-hidden>→</span>
              </ButtonLink>
              <ButtonLink href="/mon-an" size="lg" variant="secondary">
                Xem món ăn
              </ButtonLink>
            </div>
            <p className="mt-4 text-sm text-muted">Chỉ mất khoảng 1 phút · {recipes.length || "Nhiều"} món Việt dễ nấu</p>
          </div>

          {/* Minh hoạ: tủ lạnh → thực đơn */}
          <div aria-hidden className="mx-auto w-full max-w-sm">
            <div className="rounded-[2rem] bg-white p-5 shadow-xl shadow-brand-900/5 ring-1 ring-brand-100">
              <p className="text-sm font-semibold text-muted">Trong tủ lạnh có…</p>
              <div className="mt-3 flex flex-wrap gap-2">
                {FRIDGE_ITEMS.map((i) => (
                  <span key={i} className="rounded-full bg-brand-50 px-3 py-1.5 text-sm font-medium text-brand-800">
                    {i}
                  </span>
                ))}
              </div>
              <div className="my-4 flex items-center gap-2 text-brand-500">
                <span className="h-px flex-1 bg-brand-100" />
                <span className="text-xl">⬇</span>
                <span className="h-px flex-1 bg-brand-100" />
              </div>
              <ul className="space-y-2 text-sm">
                {[
                  ["🌅", "Sáng", "Trứng cuộn rau củ", "332"],
                  ["☀️", "Trưa", "Cơm gạo lứt ức gà", "486"],
                  ["🌙", "Tối", "Canh đậu phụ cà chua", "388"],
                ].map(([icon, meal, dish, kcal]) => (
                  <li key={meal} className="flex items-center gap-3 rounded-2xl bg-canvas px-3 py-2.5">
                    <span className="text-lg">{icon}</span>
                    <span className="min-w-0 flex-1">
                      <span className="block text-xs text-muted">{meal}</span>
                      <span className="block truncate font-semibold text-ink">{dish}</span>
                    </span>
                    <span className="shrink-0 font-semibold text-brand-700">{kcal} kcal</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* ---------- 3 bước ---------- */}
      <section aria-labelledby="cach-hoat-dong" className="bg-white py-14">
        <div className="mx-auto w-full max-w-5xl px-4">
          <p className="text-sm font-semibold text-brand-600">Cách hoạt động</p>
          <h2 id="cach-hoat-dong" className="mt-1 text-2xl font-extrabold tracking-tight text-ink sm:text-3xl">
            3 bước để có thực đơn cả ngày
          </h2>
          <ol className="mt-8 grid gap-4 md:grid-cols-3">
            {STEPS.map((s, i) => (
              <li key={s.title} className="relative rounded-3xl bg-canvas p-6 ring-1 ring-brand-100">
                <span className="absolute top-5 right-5 text-sm font-bold text-brand-300">0{i + 1}</span>
                <span aria-hidden className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white text-3xl shadow-sm">
                  {s.icon}
                </span>
                <h3 className="mt-4 text-lg font-bold text-ink">
                  Bước {i + 1}: {s.title}
                </h3>
                <p className="mt-1 leading-relaxed text-muted">{s.text}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* ---------- Món nổi bật ---------- */}
      {featured.length > 0 && (
        <section aria-labelledby="mon-noi-bat" className="py-14">
          <div className="mx-auto w-full max-w-5xl px-4">
            <div className="flex items-end justify-between gap-4">
              <div>
                <p className="text-sm font-semibold text-brand-600">Gợi ý hôm nay</p>
                <h2 id="mon-noi-bat" className="mt-1 text-2xl font-extrabold tracking-tight text-ink sm:text-3xl">
                  Món nổi bật
                </h2>
              </div>
              <div className="hidden sm:block">
                <ButtonLink href="/mon-an" variant="ghost">
                  Xem tất cả →
                </ButtonLink>
              </div>
            </div>
            <ul className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {featured.map((r) => (
                <li key={r._id}>
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
      <section className="px-4">
        <div className="mx-auto w-full max-w-5xl rounded-[2rem] bg-brand-600 px-6 py-10 text-center text-white sm:py-12">
          <h2 className="text-2xl font-extrabold tracking-tight sm:text-3xl">Hôm nay ăn gì? Để My Fridge lo!</h2>
          <p className="mx-auto mt-2 max-w-md text-brand-100">
            Tận dụng đồ có sẵn, bớt lãng phí, ăn vừa đủ calo mỗi ngày.
          </p>
          <ButtonLink
            href="/tao-thuc-don"
            size="lg"
            variant="light"
            className="mt-6 w-full sm:w-auto"
          >
            Tạo thực đơn miễn phí
          </ButtonLink>
        </div>
      </section>
    </main>
  );
}
