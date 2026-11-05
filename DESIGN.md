---
version: "1.0"
name: "My Fridge — Tối giản êm dịu"
description: "Web gợi ý thực đơn vừa đủ calo từ thực phẩm đang có, cho người Việt. Phong cách tối giản, êm dịu, nhiều khoảng trắng; xanh xô thơm (sage) là màu bản sắc."
colors:
  primary: "#3F7A5C"        # brand-600 — xanh sage: nút chính, ô đang chọn, khối nhấn
  primary-hover: "#33644B"  # brand-700 — hover nút chính, chữ link
  primary-soft: "#F1F7F3"   # brand-50 — nền nhạt, hover nút phụ
  canvas: "#FDF6E3"         # nền trang — kem nhạt
  surface: "#FFFFFF"        # thẻ, ô nhập, menu, footer
  secondary: "#A8DADC"      # aqua-300 — xanh nước: bề mặt phụ, nền icon
  secondary-soft: "#EEF7F7" # aqua-50
  calories: "#A14A24"       # accent-500 — chữ số calo (chỉ dùng cho calo)
  calories-soft: "#FDF0E7"  # accent-50 — nền nhãn calo (đào pastel)
  ink: "#2B3A33"            # chữ chính — xám than, không dùng đen tuyền
  muted: "#5D6B63"          # chữ phụ
  line: "#E0E0E0"           # viền 1px
  decor-sky: "#87CEEB"      # chỉ trang trí
  decor-lavender: "#E6E6FA" # chỉ trang trí (sóng nền)
  decor-sand: "#D2B48C"     # chỉ trang trí
  success-soft: "#EFFDF0"   # mint-50 — nền thông báo thành công
typography:
  family: Nunito            # Google Fonts, bộ latin + vietnamese
  hero:    { fontSize: "clamp(2.5rem, 5vw, 4rem)", fontWeight: 700, lineHeight: 1.1 }
  h1:      { fontSize: 2.25rem, fontWeight: 700 }
  h2:      { fontSize: 1.5rem,  fontWeight: 700 }
  body-md: { fontSize: 1rem,    fontWeight: 400, lineHeight: 1.6, maxWidth: 72ch }
  small:   { fontSize: 0.875rem, fontWeight: 500 }
rounded:
  sm: 8px    # rounded-lg — nhãn nhỏ
  md: 16px   # rounded-2xl — nút, ô nhập, chip, thông báo
  lg: 24px   # rounded-3xl — thẻ, khối
shadow:
  soft: "0 2px 12px rgba(43,58,51,0.06)"   # thẻ
  lift: "0 2px 8px rgba(43,58,51,0.08)"    # khi di chuột — mức tối đa
motion:
  enter: "fade + translateY 16px→0, 420ms ease-out; danh sách cách nhau 80ms"
  hover: "200ms ease-out, chỉ đổi màu + bóng + transform"
components:
  button-primary: { backgroundColor: "{colors.primary}", textColor: "#FFFFFF", rounded: "{rounded.md}", minHeight: 48px }
  button-secondary: { backgroundColor: "{colors.surface}", border: "1.5px {colors.primary-soft}", textColor: "{colors.primary-hover}", rounded: "{rounded.md}" }
  card: { backgroundColor: "{colors.surface}", border: "1px {colors.line}", shadow: "{shadow.soft}", rounded: "{rounded.lg}" }
  input: { border: "1px {colors.line}", focusRing: "2px {colors.primary} offset 2px", rounded: "{rounded.md}", minHeight: 56px }
---

# DESIGN.md — My Fridge

> File này mô tả **phong cách giao diện** của My Fridge để người và AI (Claude Code, Claude Design…) làm trang mới
> vẫn giữ đúng một phong cách. Mỗi quy tắc có **giá trị**, **quy tắc** và **lý do** — gặp trường hợp chưa nói tới,
> hãy suy ra từ lý do.
>
> **Nguồn thật** của các giá trị: `src/app/globals.css` (màu, bóng, chuyển động), `src/app/layout.tsx` (font),
> `src/components/ui.tsx`, `src/components/form.tsx`, `src/components/icons.tsx` (khối dùng chung, icon).
> Đổi giá trị ở đó thì cập nhật file này.

## Tổng quan

- **Phong cách:** tối giản, êm dịu, nhiều khoảng trắng — giao diện "thở chậm", không thúc ép, không gây áp lực.
  Hợp với người đang muốn ăn uống điều độ, kiểm soát cân nặng: không đếm calo gắt gao, chỉ nhẹ nhàng gợi ý.
- **Bản sắc My Fridge giữ lại:** xanh lá (nay là **xanh xô thơm — sage**) = rau tươi, lành mạnh; chủ đề nấu ăn
  từ đồ trong tủ lạnh; **100% tiếng Việt**; calo luôn nổi bật bằng một màu riêng; luôn có lưu ý sức khoẻ.
- **Người dùng:** người Việt, **phần lớn dùng điện thoại**, nhiều người không rành công nghệ → chữ dễ đọc, nút to,
  mỗi màn hình một việc chính.
- **Độ thoáng:** 3/10 (rất thoáng) · **Độ biến tấu:** 2/10 (có cấu trúc, nhất quán) · **Chuyển động:** 4/10 (nhẹ).
- **Giọng văn:** xưng "bạn", câu ngắn, ấm áp. Lỗi nói **nguyên nhân + cách làm**, không mã lỗi kỹ thuật.
  Không dùng sáo ngữ quảng cáo ("đột phá", "vượt trội", "thế hệ mới"); không hứa hẹn y khoa.
- **Nguồn cảm hứng:** mẫu "Minimalismo Sereno de Bem-Estar" (designmd.app) — lấy tinh thần tối giản êm dịu,
  bảng màu dịu, font tròn, bo góc mềm, bóng nhẹ, chuyển động êm; **điều chỉnh** để hợp chủ đề và dễ dùng
  (xem mục "Khác với mẫu gốc" cuối file).

## Màu

Khai báo trong `@theme` ở `src/app/globals.css`, dùng qua class Tailwind (`bg-brand-600`, `text-ink`, `border-line`…).

### Xanh xô thơm (sage) — `brand-*` · màu chính, bản sắc
| Token | Hex | Dùng cho |
|---|---|---|
| `brand-50` | `#f1f7f3` | Nền nhạt: chip nguyên liệu, nhãn bữa, hover nút phụ / chip |
| `brand-100` | `#e0eee5` | Nền rất nhạt phụ |
| `brand-200` | `#c3dfcd` | Viền nút phụ, viền thông báo thành công |
| `brand-300` | `#9dc9ae` | Viền khi di chuột lên chip / nút lọc |
| `brand-400` | `#74ad8c` | Chấm đầu dòng, icon mũi tên trang trí |
| `brand-500` | `#55916f` | Vòng focus (bàn phím, ô nhập đang gõ), chấm "đang xử lý" |
| **`brand-600`** | **`#3f7a5c`** | **Nút chính, ô đang chọn, khối "calo mục tiêu" / "tổng trong ngày", logo, gạch chỉ báo menu** |
| `brand-700` | `#33644b` | Hover nút chính, chữ link, chữ nút phụ |
| `brand-800/900` | `#2a513d` / `#223f31` | Chữ trên nền nhạt (lưu ý, thành công) |

*Lý do:* xanh sage giữ ý "rau xanh" của My Fridge nhưng dịu, êm hơn xanh lá tươi. `brand-600` vẫn đủ đậm để **chữ trắng
đạt tương phản 5:1** (chuẩn WCAG AA).

### Xanh nước — `aqua-*` · bề mặt phụ
| Token | Hex | Dùng cho |
|---|---|---|
| `aqua-50` | `#eef7f7` | Nền ô icon, ô ảnh món chưa có ảnh, khối "Lưu ý sức khoẻ", thông báo loại "lưu ý", khối minh hoạ 3 bước |
| `aqua-100` | `#d9eeef` | Avatar tài khoản, bước đã xong, lớp sóng nền |
| `aqua-300` | `#a8dadc` | Màu gốc của mẫu — hover avatar, trang trí |
| `aqua-800` | `#25595b` | Icon / chữ đặt trên nền aqua |

### Đào pastel — `accent-*` · **chỉ dùng cho calo**
| Token | Hex | Dùng cho |
|---|---|---|
| `accent-50` | `#fdf0e7` | Nền nhãn calo |
| `accent-100` | `#fbdcc8` | Dự phòng |
| `accent-500` | `#a14a24` | Chữ số calo + icon ngọn lửa (tương phản 5.3:1 trên nền đào) |

*Lý do:* calo là con số người dùng tìm nhiều nhất → một màu ấm riêng để mắt thấy ngay. Dùng cho thứ khác sẽ mất ý nghĩa.

### Nền, chữ, viền, trang trí
| Token | Hex | Dùng cho |
|---|---|---|
| `canvas` | `#fdf6e3` | Nền toàn trang (kem nhạt), nền nhãn phụ trong thẻ |
| `white` | `#ffffff` | Thẻ, ô nhập, menu, footer, phần mở đầu trang chủ |
| `ink` | `#2b3a33` | Chữ chính (xám than — **không dùng `#000`**) |
| `muted` | `#5d6b63` | Chữ phụ (tương phản 5.2:1 trên nền kem) |
| `line` | `#e0e0e0` | Viền 1px của thẻ, ô nhập, chip, menu |
| `sky` / `lavender` / `sand` | `#87ceeb` / `#e6e6fa` / `#d2b48c` | **Chỉ trang trí** (sóng nền, chấm) — không dùng cho chữ |
| `mint-50` | `#effdf0` | Nền thông báo thành công |

### Màu trạng thái (`Notice` trong `ui.tsx`)
| Loại | Nền / viền / chữ | Icon |
|---|---|---|
| Lỗi | `bg-red-50 border-red-200 text-red-800` (chữ lỗi ô nhập `text-red-700`) | `CircleAlert` |
| Cảnh báo (cần mua thêm, link hết hạn) | `bg-amber-50 border-amber-200 text-amber-900` | `ShoppingCart` |
| Lưu ý | `bg-aqua-50 border-aqua-100 text-brand-900` | `Lightbulb` |
| Thành công | `bg-mint-50 border-brand-200 text-brand-900` | `CircleCheck` |
| Nút bị khoá | `bg-stone-300 text-stone-600` | — |

### Quy tắc màu
- **Luôn nền sáng**: `dark:` đã bị tắt trong `globals.css`. Không thêm chế độ tối.
- **Không nền chuyển màu (gradient)** — chỉ màu phẳng. (Ngoại lệ duy nhất: vệt lấp lánh của khung "đang tải".)
- Mọi cặp chữ/nền phải đạt **≥ 4.5:1**. Đã đo: trắng/`brand-600` 5.1 · `ink`/`canvas` 11.1 · `muted`/`canvas` 5.2 ·
  `accent-500`/`accent-50` 5.3 · `brand-50`/`brand-600` 4.7.

## Chữ

- **Font:** **Nunito** (`next/font/google`, bộ `latin` + `vietnamese`, độ đậm 400/500/600/700), biến `--font-nunito`
  → class `font-sans`. *Lý do:* nét tròn, mềm, thân thiện; dấu tiếng Việt hiển thị đầy đủ.
- **Thang chữ:**

| Vai trò | Class | Ví dụ |
|---|---|---|
| Tiêu đề lớn trang chủ | `text-[clamp(2.5rem,5vw,4rem)] leading-[1.1] font-bold tracking-tight` | "Có sẵn đồ trong tủ lạnh…" |
| Tiêu đề trang (`PageHeader`) | `text-[2.25rem] leading-tight font-bold tracking-tight` | "Món ăn", "Tạo thực đơn" |
| Tiêu đề phần (trang chủ) | `text-[1.75rem] sm:text-4xl font-bold` | "Món nổi bật" |
| Tiêu đề khối / bước | `text-2xl font-bold` hoặc `text-xl font-bold` | "Thực đơn của bạn", "Dinh dưỡng" |
| Tiêu đề thẻ | `text-lg font-bold leading-snug` | Tên món |
| Dòng nhỏ phía trên tiêu đề | `text-sm font-semibold tracking-wide text-brand-600` | "Thư viện món" |
| Nội dung | `text-base` (16px), `line-height: 1.6`, tối đa `max-w-[72ch]` | Mô tả, các bước nấu |
| Chú thích / nhãn | `text-sm` (14px) đậm 500, rất nhỏ `text-xs` | "1 khẩu phần (447 g)" |

- **Quy tắc:** tiêu đề tối đa độ đậm **700** (không dùng 800); không viết HOA toàn bộ câu tiếng Việt; ô nhập tối thiểu
  16px (để iPhone không tự phóng to); số liệu dinh dưỡng in đậm kèm đơn vị; số lẻ dùng dấu phẩy (`formatServings`).

## Bố cục

- **Khoảng cách:** bậc 8px là chính (`gap-2`, `p-4`, `p-5`, `mt-6`, `gap-10`…).
- **Lề hai bên:** `px-4` trên điện thoại, `sm:px-6` (24px) từ 640px.
- **Khoảng cách giữa các phần lớn (trang chủ):** `py-[clamp(3.5rem,8vw,8rem)]`.
- **Độ rộng tối đa** (căn giữa `mx-auto w-full`):

| Trang | Độ rộng |
|---|---|
| Trang chủ, danh sách món, menu, footer | `max-w-5xl` |
| Chi tiết món | `max-w-3xl` |
| Tạo thực đơn, xem thực đơn, hồ sơ | `max-w-2xl` |
| Đăng nhập, đăng ký, 404, trang lỗi | `max-w-md` |

- **Phần mở đầu trang chủ:** chia đôi — chữ trái, minh hoạ phải (`md:grid-cols-[1.15fr_1fr]`); điện thoại xếp dọc.
- **Phần giới thiệu tính năng ("3 bước"): bố cục so le (zig-zag)** — mỗi bước một hàng, khối icon và chữ đổi bên
  trái/phải (`sm:flex-row` / `sm:flex-row-reverse`). **Không dùng 3 cột bằng nhau** cho phần giới thiệu.
- **Lưới thẻ món** (nội dung, không phải giới thiệu): `grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4`.
- **Mỗi màn hình một việc chính**, một nút `primary` nổi bật nhất.
- **Thanh nút dính đáy** (trang tạo thực đơn): `sticky bottom-0 z-[100] bg-white/95 backdrop-blur border-t border-line`,
  chừa "tai thỏ": `pb-[max(0.75rem,env(safe-area-inset-bottom))]`.
- **Chiều cao toàn màn hình:** dùng `min-h-dvh`, **không** dùng `h-screen`.
- **Thứ tự chồng lớp (z-index):** nền 0 · menu dính / thanh nút dính 100 · lớp phủ 200 · hộp thoại 300 · thông báo nổi 500.
- **Nhóm trang:** các trang của web nằm trong `src/app/(site)/` (có menu + footer); `/studio` nằm ngoài.

## Độ nổi & chuyển động

- **Ba lớp bề mặt:** nền kem `canvas` → thẻ trắng (`border border-line shadow-soft`) → khối nhấn `bg-brand-600`.
- **Bóng:** `shadow-soft` (`0 2px 12px rgba(43,58,51,.06)`) cho thẻ; `shadow-lift` (`0 2px 8px rgba(43,58,51,.08)`)
  khi di chuột — **không bao giờ đậm hơn mức này**. Phân tách chủ yếu bằng viền mảnh `border-line`.
- **Chuyển động** (khai báo trong `globals.css`):
  - Xuất hiện: `animate-enter` — hiện dần + trượt lên 16px → 0 trong **420ms ease-out**. Dùng cho tiêu đề trang,
    thẻ chính, từng bước của trang tạo thực đơn.
  - Danh sách: class `stagger` trên thẻ cha + `style={{ "--i": số thứ tự }}` trên từng mục → mỗi mục trễ **80ms**.
  - Di chuột: **200ms ease-out** — đổi màu, `shadow-lift`, thẻ nhích lên 2px (`hover:-translate-y-0.5`).
  - Bấm nút: lún xuống 1px (`active:translate-y-px`).
  - **Chỉ làm động `transform` và `opacity`** (thanh tiến độ dùng `scaleX`, không đổi `width`).
  - Người dùng bật "giảm chuyển động" (`prefers-reduced-motion`) → **tắt hết** hiệu ứng.
- **Trang trí nền:** sóng mảnh vẽ bằng SVG trong trang (màu `lavender` / `aqua-100`, đơn sắc, đứng yên) ở cuối phần mở đầu trang chủ.

## Hình khối

| Mức | Class | Dùng cho |
|---|---|---|
| 8px | `rounded-lg` (`rounded-md` cho số đếm rất nhỏ) | Nhãn nhỏ: calo, thời gian, bữa, nguyên liệu, gợi ý |
| 12px | `rounded-xl` | Ô logo, ô icon tiêu đề phần, nút nhỏ trong ô nhập |
| 16px | `rounded-2xl` | **Nút**, ô nhập, chip, nút lọc, thông báo, bảng, dòng danh sách |
| 24px | `rounded-3xl` | **Thẻ**, khối nhấn, trạng thái rỗng, khối minh hoạ |
| Tròn | `rounded-full` | Chỉ thứ tròn thật: avatar, vòng số bước, nền icon tròn, thanh tiến độ, chấm |

*Lý do:* bo góc mềm nhưng không "viên thuốc" → êm dịu mà vẫn gọn gàng, có cấu trúc.

## Icon

- **Không dùng emoji trên giao diện.** Dùng bộ icon nét mảnh **Lucide** (`lucide-react`, ghim bản `1.59.0`).
- **Chỉ import từ `src/components/icons.tsx`**: `Icons.<tên>` + component `<Icon icon={…} size={…} />`
  (nét mặc định `strokeWidth={1.75}`, tự `aria-hidden`). Icon lớn trang trí dùng nét 1.25–1.5.
- **Bảng nghĩa:** logo `Leaf` · món `CookingPot` · calo `Flame` · thời gian `Clock` · sáng/trưa/tối `Sunrise`/`Sun`/`Moon`
  (map `MEAL_ICONS`) · thực phẩm `ShoppingBasket` · thực đơn `ClipboardList` · đổi món `RefreshCw` · lưu `Save` ·
  khoá `Lock` · link `Link2` · sức khoẻ `Stethoscope` · mục tiêu `Target` · đã chọn `Check`.
- Icon luôn đi kèm chữ (trừ logo có `aria-label`); cỡ 16px trong nhãn, 18–20px trong nút, 28–64px khi minh hoạ.

## Thành phần

**Luôn dùng lại khối có sẵn**, không viết lại bằng class rời.

- **Nút — `buttonClass(variant, size, extra)` / `ButtonLink`** (`ui.tsx`): `rounded-2xl font-semibold`,
  cỡ `md` = 48px (`min-h-12 px-5`), `lg` = 56px (`min-h-14 px-7 text-lg`).

| Biến thể | Mặc định | Di chuột | Bị khoá | Dùng khi |
|---|---|---|---|---|
| `primary` | `bg-brand-600 text-white` | `bg-brand-700 shadow-lift` | `bg-stone-300 text-stone-600` | Hành động chính |
| `secondary` | `bg-white border-[1.5px] border-brand-200 text-brand-700` | `border-brand-400 bg-brand-50` | mờ 60% | Hành động phụ |
| `ghost` | chữ `text-brand-700` | `bg-brand-50` | mờ 60% | Link dạng nút |
| `light` | `bg-white text-brand-700` | `bg-brand-50 shadow-lift` | — | Nút trên khối xanh |

- **Đang xử lý:** **không dùng vòng xoay** — nút khoá lại, chữ "Đang lưu…" + 3 chấm nhấp nháy (`PendingDots`).
  `SubmitButton` (`form.tsx`) tự làm khi form đang gửi.
- **Thẻ:** `cardClass` = `rounded-3xl border border-line bg-white shadow-soft`. Thẻ bấm được thêm
  `transition duration-200 hover:-translate-y-0.5 hover:shadow-lift`.
- **Chip — `Chip`** (`form.tsx`): `min-h-12 rounded-2xl border-[1.5px]`; chưa chọn `border-line bg-white`, hover
  `border-brand-300 bg-brand-50`; đang chọn `bg-brand-600 text-white` (thực phẩm thêm icon `Check`).
  Chip có dòng mô tả (mức vận động) dùng `stacked`.
- **Ô nhập — `TextField` / `PasswordField` / `NumberField`** (`form.tsx`): `min-h-14 rounded-2xl border border-line`,
  khi gõ `ring-2 ring-brand-500 ring-offset-2`; **nhãn luôn ở trên** (không dùng nhãn nổi); lỗi `border-red-300 bg-red-50`
  + dòng `text-sm text-red-700` ngay dưới ô; mật khẩu có nút "Hiện / Ẩn".
- **Thông báo — `Notice`** (`ui.tsx`): `rounded-2xl border p-4 text-sm`, icon trong ô tròn trắng bên trái,
  `role="alert"` cho lỗi.
- **Trạng thái rỗng — `EmptyState`** (`ui.tsx`): `rounded-3xl border-[1.5px] border-dashed border-line bg-white`,
  icon trong vòng tròn `bg-aqua-50`, tiêu đề + mô tả, **luôn có nút bước tiếp theo**. Bản gọn 1 dòng dùng khi bên
  dưới còn nội dung cần thấy ngay (bước 2 chưa chọn thực phẩm).
- **Đang tải — `Skeleton`, `LoadingLabel`** + `loading.tsx`: khung lấp lánh **đúng hình dạng** nội dung sắp hiện;
  `LoadingLabel` = 3 chấm + chữ. Không dùng vòng xoay.
- **Menu — `SiteHeader` / `HeaderNav` / `AccountLink`:** cao 64px, `sticky top-0 z-[100] bg-white/90 backdrop-blur
  border-b border-line`; logo `Leaf` trong ô `rounded-xl bg-brand-600`; mục đang xem: **gạch chỉ báo 2px màu
  `brand-600` bên dưới + chữ `font-semibold`**; nút "Tạo thực đơn" `rounded-2xl bg-brand-600`; tài khoản: "Đăng nhập"
  hoặc avatar tròn `bg-aqua-100`.
- **Footer — `SiteFooter`:** nền trắng, viền trên `border-line`; **luôn có khối "Lưu ý sức khoẻ"** (`bg-aqua-50`,
  icon `Stethoscope`).
- **Riêng của My Fridge:**
  - *Thẻ món* (`RecipeCard`): ảnh 16:10 (chưa có ảnh → nền `aqua-50` phẳng + icon `CookingPot`), nhãn bữa `rounded-lg
    bg-white/95`, nhãn calo (`Flame`, đào) và thời gian (`Clock`, `bg-canvas`).
  - *Thẻ bữa ăn* (`MealEntryCard`): icon bữa trong vòng tròn `aqua-50`, "Mục tiêu ~… kcal", tên món (link), khẩu phần,
    nhãn calo/đạm/tinh bột/béo, nút "Đổi món".
  - *Tổng dinh dưỡng* (`NutritionTotals`): khối `bg-brand-600`, chữ phụ `text-brand-50`, thanh tiến độ trắng (`scaleX`).
  - *Thanh bước*: 3 vòng tròn trong thẻ trắng; bước hiện tại `bg-brand-600`, đã xong `bg-aqua-100` + icon `Check`.
  - *Ảnh món*: chỉ ảnh thật trong Sanity; **không ảnh giả / ảnh AI**.

## Nên / Không nên

**Nên**
- Bố cục thoáng, chữ mềm, nhiều khoảng trắng; mỗi màn hình một việc chính.
- Dùng lại khối trong `ui.tsx` / `form.tsx` / `icons.tsx`.
- Vùng chạm **≥ 44px** cho mọi thứ bấm được (link chữ thêm `min-h-11 inline-flex items-center`).
- Trang tải dữ liệu luôn có **đang tải**, **lỗi** (kèm "Thử tải lại") và **rỗng** (kèm nút bước tiếp theo).
- Chuyển động nhẹ, phản hồi chạm rõ ràng (lún 1px), tôn trọng "giảm chuyển động".
- Chữ 100% tiếng Việt có dấu; tiêu đề trang dạng "… – My Fridge".
- Hỗ trợ bàn phím / trình đọc màn hình: `aria-pressed`, `aria-current`, `aria-live`, icon `aria-hidden`.

**Không nên**
- ❌ Emoji trên giao diện — dùng icon Lucide.
- ❌ Nền chuyển màu, đốm mờ; bóng đậm hơn `0 2px 8px rgba(…,0.08)`.
- ❌ Đen tuyền `#000`; màu quá chói (độ bão hoà > 80%); màu tím/xanh dương làm màu chính.
- ❌ Dùng màu đào cho thứ khác ngoài calo; màu trang trí (`sky`, `lavender`, `sand`) cho chữ.
- ❌ Phần giới thiệu tính năng dạng 3 cột bằng nhau — dùng so le hoặc lưới lệch.
- ❌ `h-screen` — dùng `min-h-dvh`.
- ❌ Vòng xoay "đang tải" — dùng khung lấp lánh / 3 chấm.
- ❌ Chế độ nền tối, class `dark:`.
- ❌ Chữ tiếng Anh trên giao diện; sáo ngữ quảng cáo; lorem ipsum.
- ❌ Ảnh giả, link ảnh ngoài có thể hỏng; hứa hẹn y khoa ("giảm 5kg/tuần").

## Cỡ màn hình

- **Điện thoại trước**, mở rộng bằng `sm:` (640px) · `md:` (768px) · `lg:` (1024px).
- **Khổ kiểm tra bắt buộc: 375px** — không tràn ngang (`scrollWidth <= 375`), nút ≥ 44px, menu trên 1 dòng.
  Kiểm tra thêm 1280px cho máy tính.
- Menu: dưới `sm` ẩn chữ "My Fridge" và "Trang chủ" (giữ logo + "Món ăn" + "Tạo thực đơn" + tài khoản).
- Bố cục nhiều cột gập về 1 cột trên điện thoại; khối so le xếp dọc (khối icon ở trên, chữ ở dưới).
- Hàng nút lọc: điện thoại vuốt ngang (`overflow-x-auto`), máy tính xuống dòng.
- Nút chính: điện thoại `w-full`, từ `sm:` `sm:w-auto`; nhóm nút `flex-col` → `sm:flex-row`.

## Câu lệnh mẫu cho AI

- *"Tạo trang `/…` theo DESIGN.md: `PageHeader` có dòng nhỏ phía trên, nội dung trong `cardClass`, nút bằng
  `buttonClass`, icon từ `icons.tsx`, có `loading.tsx`, lỗi bằng `Notice`, rỗng bằng `EmptyState`, danh sách dùng
  `stagger`. Chữ tiếng Việt, kiểm tra ở 375px."*
- *"Thêm form … theo DESIGN.md: `TextField` / `NumberField` / `Chip` / `SubmitButton` trong `form.tsx`, nhãn ở trên,
  lỗi ngay dưới ô bằng tiếng Việt, nút chính `w-full` trên điện thoại."*
- *"Thêm khối giới thiệu theo DESIGN.md: bố cục so le, khối icon `bg-aqua-50 rounded-3xl`, không 3 cột bằng nhau."*
- Với Claude Design: tải file này lên → *"Tạo design system từ DESIGN.md này cho web My Fridge."*

**Danh sách kiểm tra trước khi push**
- [ ] Không emoji, không gradient, không vòng xoay, bóng ≤ `shadow-lift`.
- [ ] Màu chỉ trong bảng trên; cặp chữ/nền mới đo tương phản ≥ 4.5:1.
- [ ] Có đủ đang tải / lỗi / rỗng (nếu tải dữ liệu); chuyển động tắt được.
- [ ] Ở 375px: không tràn ngang, nút ≥ 44px, menu 1 dòng.
- [ ] `npm run lint` và `npm run build` không lỗi.

## Khác với mẫu gốc (có chủ đích)

| Mẫu gốc | My Fridge | Lý do |
|---|---|---|
| Nút chính nền trắng, chữ xám `#E0E0E0` | Nền `brand-600`, chữ trắng | Chữ xám trên trắng gần như không đọc được (tương phản ~1.3:1) |
| Bảng màu toàn pastel | Giữ **xanh sage** làm màu chính | Bản sắc "rau xanh, lành mạnh" của My Fridge |
| Không có màu riêng cho số liệu | Màu **đào** riêng cho calo | Calo là thông tin quan trọng nhất |
| Bo góc nút 8px | Nút 16px, nhãn nhỏ 8px | Nút to dễ chạm trên điện thoại trông cân đối hơn |
| Viền 1px, tối đa rộng 1280px | Giữ độ rộng theo loại trang (`max-w-md` … `max-w-5xl`) | Dòng chữ không quá dài, dễ đọc |
| Font mono JetBrains Mono | Không dùng | Web không có mã hay số liệu kỹ thuật |
| Ảnh minh hoạ thiên nhiên | Icon Lucide + sóng nền SVG | Không dùng ảnh giả; nhẹ, tải nhanh |
