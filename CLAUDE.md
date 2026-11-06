@AGENTS.md
@DESIGN.md

# Glow up with me

## Dự án là gì
Website giúp người Việt **chọn thực phẩm đang có** (trong tủ lạnh, trong bếp) để nhận
**thực đơn sáng / trưa / tối vừa đủ calo**, hỗ trợ **kiểm soát cân nặng**.

## Công nghệ (stack)
- **Next.js** (App Router, TypeScript) + **Tailwind CSS** — giao diện website.
- **Sanity** — nơi lưu và quản lý công thức món ăn (tên món, nguyên liệu, calo, cách nấu).
- **Supabase** — cơ sở dữ liệu lưu thực đơn của người dùng.
- **Vercel** — nơi deploy (đưa website lên mạng).

## Cấu trúc thư mục
- `src/app/` — các trang của website (`page.tsx` = trang chủ, `layout.tsx` = khung chung).
- `src/app/globals.css` — CSS chung, nạp Tailwind.
- `src/app/(site)/` — nhóm các trang của web, có menu (`SiteHeader`) + footer lưu ý sức khoẻ (`SiteFooter`)
  trong `layout.tsx`, trang lỗi `error.tsx`, các file `loading.tsx` (khung đang tải). Dấu ngoặc `(site)` KHÔNG
  xuất hiện trên đường dẫn. `/studio` nằm ngoài nhóm nên không có menu/footer. `src/app/not-found.tsx` = trang 404 chung.
- `src/app/(site)/mon-an/` — trang danh sách món `/mon-an` (thẻ món + lọc theo bữa trong `RecipeList.tsx`).
- `src/app/(site)/mon-an/[slug]/` — trang chi tiết món (dinh dưỡng, nguyên liệu, các bước) + `not-found.tsx`.
- `src/app/studio/[[...tool]]/` — trang quản trị Sanity Studio tại `/studio`.
- `src/app/(site)/tao-thuc-don/` — trang tạo thực đơn 3 bước (`Planner.tsx`): 1) thông tin cá nhân → calo mục tiêu,
  2) chọn thực phẩm đang có, 3) gợi ý món + khẩu phần, nút "Lưu thực đơn" (`actions.ts` — server action).
- `src/app/(site)/thuc-don/[id]/` — xem lại thực đơn đã lưu + nút "Sao chép link" (`CopyLinkButton.tsx`).
- `src/app/(site)/(auth)/` — đăng nhập `/dang-nhap`, đăng ký `/dang-ky`, quên mật khẩu `/quen-mat-khau`,
  đặt lại mật khẩu `/dat-lai-mat-khau`; `actions.ts` (signIn/signUp/signOut/requestPasswordReset/updatePassword).
- `src/app/(site)/nhat-ky/` — **Nhật ký** (phải đăng nhập): tab Ăn uống (4 bữa sáng/trưa/tối/phụ; món có sẵn hoặc tự nhập)
  + tab Tập luyện (mục tiêu + trình độ + môn yêu thích → lịch tuần, "Đã tập"); `actions.ts` tự tính lại calo trên máy chủ.
  Lõi: `src/lib/diary.ts`, `src/lib/diary-db.ts`, `src/lib/workout-plan.ts` (calo đốt thêm = (MET − 1) × kg × giờ),
  `data/activities.ts` (môn thể thao + bài tập, MET), `data/recipes-snacks.ts` (12 món phụ, `meals: ["snack"]`).
  - Tab **Sức khoẻ** (`?tab=suc-khoe`, `HealthTab.tsx` + `health-actions.ts`): người dùng iPhone xuất file `export.zip` từ app Sức khoẻ
    và chọn file ngay trên web; `src/lib/apple-health.ts` đọc file NGAY TRÊN MÁY (fflate, không tải file gốc lên) → chỉ gửi tóm tắt
    (bước chân + năng lượng hoạt động mỗi ngày, các kỳ kinh nguyệt) vào bảng `health_daily`, `cycle_logs` (`supabase/migrations/20261106_suc_khoe.sql`,
    RLS chỉ chủ tài khoản). Bước chân lấy nguồn nhiều nhất mỗi ngày (khỏi cộng đôi iPhone + Watch). `src/lib/cycle.ts` = chu kỳ trung bình + ngày dự kiến (chỉ tham khảo).
    Tổng ngày: "đốt thêm" = số lớn hơn giữa buổi tập đã ghi và năng lượng hoạt động của Apple (tránh tính hai lần). Web KHÔNG đọc thẳng được Apple Sức khoẻ /
    Health Connect (chỉ app cài trên máy mới đọc được); Fitbit Web API đã tắt từ 11/2026 → Google Health API (chưa làm).
- `src/app/(site)/ho-so/` — hồ sơ: thông tin cơ thể (`ProfileForm.tsx` + `actions.ts`), thực đơn đã lưu
  (`SavedPlansList.tsx`), đổi mật khẩu, đăng xuất. Chưa đăng nhập → chuyển tới `/dang-nhap?next=/ho-so`.
- `src/app/auth/callback/route.ts` — nhận link từ email (xác nhận tài khoản / đặt lại mật khẩu).
- **Web app trên điện thoại (PWA):** `src/app/manifest.ts` (tên, màu, icon, lối tắt), `public/icons/` (icon 192/512/maskable + apple-touch),
  `public/sw.js` (chỉ lưu file tĩnh + trang `/offline`; KHÔNG lưu trang đăng nhập / dữ liệu cá nhân), `src/components/PwaSetup.tsx`
  (đăng ký service worker + gợi ý "Cài ứng dụng"; iPhone: Chia sẻ → Thêm vào MH chính), `src/app/offline/page.tsx`.
- `src/proxy.ts` — làm mới phiên đăng nhập Supabase trước mỗi trang (Next 16 gọi là "proxy", trước là middleware).
- `src/lib/maps.ts` — `mapsSearchUrl(slug, name)`: link Google Maps tìm quán bán món ăn ngoài gần người dùng (Google Maps URLs,
  miễn phí, không cần API key, web không đọc/lưu vị trí). Một số món tìm theo loại cửa hàng (`QUERY_BY_SLUG`). Nút "Tìm quán gần bạn"
  ở trang chi tiết món ăn ngoài và thẻ bữa ăn ngoài (bước 3, `/thuc-don/[id]`).
- `src/lib/meal-plan.ts` — công thức tính: calo mục tiêu (Mifflin-St Jeor), chia bữa 25/40/35%,
  gia vị luôn có (`PANTRY_STAPLES`), nhóm nguyên liệu, chấm điểm món, khẩu phần (0,5–2,5, bước 0,25).
- `src/lib/supabase.ts` — kết nối Supabase cho khách (anon key, không phiên); `src/lib/meal-plans-db.ts` — đọc thực đơn theo id.
- `src/lib/supabase/server.ts` — kết nối Supabase CÓ phiên đăng nhập (cookie, `@supabase/ssr`): `createSupabaseServer()`,
  `getCurrentUser()`. `src/lib/auth-helpers.ts` — `safeNext` (chỉ chuyển trang nội bộ), dịch lỗi đăng nhập sang tiếng Việt.
  `src/lib/profile.ts` — đọc hồ sơ. `src/components/form.tsx` — ô nhập dùng chung (Chip, NumberField, TextField,
  PasswordField, SubmitButton). `src/components/AccountLink.tsx` — nút tài khoản trên menu.
- `supabase/schema.sql` — SQL tạo bảng `meal_plans` + RLS (chạy trong Supabase SQL Editor).
- `src/components/icons.tsx` — bộ icon Lucide dùng chung (`Icons.*`, `<Icon>`, `MEAL_ICONS`); KHÔNG dùng emoji trên giao diện.
- `src/components/ui.tsx` — khối giao diện dùng chung: `buttonClass`/`ButtonLink` (nút to ≥48px), `Notice` (thông báo
  lỗi/lưu ý), `EmptyState` (trạng thái rỗng), `Skeleton`/`LoadingLabel`/`PendingDots` (đang tải), `PageHeader`, `cardClass` (thẻ).
- `src/components/` — `RecipeCard.tsx` (thẻ món), `RecipeImage.tsx` (ảnh món, có ô thay thế khi chưa có ảnh),
  `MealEntryCard.tsx` (thẻ 1 bữa), `NutritionTotals.tsx` (tổng dinh dưỡng trong ngày).
- `src/sanity/` — kết nối Sanity: `env.ts` (đọc biến môi trường), `lib/client.ts` (đọc dữ liệu),
  `lib/image.ts` (link ảnh), `lib/queries.ts` (truy vấn GROQ), `lib/recipes.ts` (hàm lấy món,
  cache 1 giờ, lỗi thì trả rỗng chứ không làm sập web), `meals.ts` (nhãn bữa sáng/trưa/tối),
  `schemaTypes/recipe.ts` (loại nội dung "Món ăn").
  - Code của trang web KHÔNG import từ `schemaTypes/` (sẽ kéo cả gói Studio nặng vào trang).
- `sanity.config.ts`, `sanity.cli.ts` — cấu hình Studio và lệnh `npx sanity`.
- `data/nutrition.ts` — bảng dinh dưỡng /100 g, là **danh sách tên nguyên liệu chuẩn**.
- `data/recipes.ts` (24 món đầu) + `data/recipes-more.ts` (36 món thêm) — 60 món **tự nấu** (20 mỗi bữa);
  calo/đạm/tinh bột/béo được tính tự động từ số gram.
- `data/eatout.ts` — 32 món **ăn ngoài / mua sẵn** (phở, bún, cơm tấm, bánh mì, đồ cửa hàng tiện lợi…): không có
  công thức, calo **ước tính** cho 1 phần thường bán, kèm `servingNote`, `healthyTip`, `whereToBuy`.
- `scripts/import-recipes.ts` — script nhập món vào Sanity.
- `data/image-credits.ts` — danh sách nguồn ảnh thật (tác giả, giấy phép, link Wikimedia Commons) đã gắn vào món trên Sanity.
- `public/` — ảnh, icon tĩnh.
- `public/minh-hoa/` — 14 hình vẽ SVG minh hoạ theo loại món (tô phở, bún trộn, đĩa cơm, canh + cơm, cháo, bánh mì, xôi,
  cuốn, salad, sinh tố, trứng, khoai, bánh xèo, món mặn chung).
- `src/lib/illustrations.ts` — `illustrationFor(name)`: chọn hình vẽ theo từ khoá trong tên món (bỏ dấu); món chưa có
  ảnh thật trong Sanity tự hiện hình vẽ kèm nhãn "Hình minh hoạ" (`RecipeImage.tsx`).
- `.env.example` — mẫu tên biến môi trường (KHÔNG chứa giá trị thật).
- `.claude/agents/` — 4 trợ lý theo model (xem mục "Chia việc theo model").
- `DESIGN.md` — **phong cách giao diện** (màu, chữ, nút, thẻ, bố cục, nên/không nên, câu lệnh mẫu). Đọc trước khi làm giao diện.

## Sanity (công thức món ăn)
- Project ID `b4tnn0pq`, dataset `production` (dataset public: đọc không cần token).
- Loại nội dung `recipe` ("Món ăn"): `name`, `slug`, `image`, `description`,
  `meals` (`breakfast`/`lunch`/`dinner`), `ingredients[] {name, grams}`, `servingGrams`,
  `calories`, `protein`, `carbs`, `fat`, `cookMinutes`, `steps[]`.
- Trường `image` có thêm `credit` (tác giả), `license` (giấy phép), `sourceUrl` (link gốc). Ảnh thật chỉ dùng ảnh có giấy
  phép mở (CC0 / Public domain / CC BY / CC BY-SA, ví dụ từ Wikimedia Commons) và PHẢI ghi `credit` + `license`; trang chi
  tiết món hiện dòng "Ảnh: … · giấy phép · Nguồn ảnh". Muốn dùng ảnh tự chụp: vào `/studio`, mở món, tải ảnh lên, ghi tác
  giả là chính mình, giấy phép "Ảnh tự chụp".
- Ảnh **gần giống món** (không phải đúng công thức, ví dụ ảnh cháo gà cho món cháo yến mạch gà) → bật `image.illustrative`;
  web hiện nhãn "Ảnh minh hoạ" trên ảnh và ghi "ảnh gần giống món" ở dòng tác giả. Món chưa có ảnh phù hợp thì để trống → hình vẽ.
- Trường `kind`: `home` (Tự nấu, mặc định) hoặc `eatout` (Ăn ngoài). Món ăn ngoài không có `ingredients`/`steps`/
  `cookMinutes`, thay bằng `servingNote`, `healthyTip`, `whereToBuy`. Truy vấn dùng `coalesce(kind, "home")`.
- Mỗi món có ID cố định `recipe-<slug>` → nhập lại sẽ ghi đè, không trùng.
- Thêm món mới: thêm vào `data/recipes.ts` (chỉ dùng tên nguyên liệu có trong `data/nutrition.ts`),
  rồi chạy `npm run import:recipes`. Món ăn ngoài thêm vào `data/eatout.ts` (ghi thẳng calo + các chất).
- Trang tạo thực đơn: mỗi bữa chọn "Tự nấu" hoặc "Ăn ngoài". Món ăn ngoài **cố định 1 phần**
  (`EATOUT_SERVINGS`); `rebalanceTargets` chia lại calo còn lại cho các bữa tự nấu để tổng ngày sát mục tiêu.
- Studio tại `/studio` cần thêm địa chỉ web vào CORS origins (sanity.io/manage → API).

## Supabase (đăng nhập + lưu thực đơn)
- Project "Sol-1". Đăng nhập bằng **email + mật khẩu** (Supabase Auth).
- Bảng `public.profiles` (1 dòng / tài khoản, tự tạo bằng trigger khi đăng ký): `display_name`, `gender`, `age`,
  `height_cm`, `weight_kg`, `activity`, `goal`. RLS: chỉ chủ tài khoản xem / tạo / sửa (không xoá).
- Bảng nhật ký `food_logs`, `workout_logs`, `workout_plans` (1 dòng/người): mỗi bảng có `user_id` + RLS — chỉ xem / thêm /
  sửa / xoá dòng của mình; khách không có quyền. SQL ở `supabase/migrations/` (đã chạy) và `supabase/schema.sql`.
- Bảng `public.meal_plans`: `id`, `created_at`, `user_id`, `user_input` (jsonb), `target_calories`,
  `selected_foods` (text[]), `breakfast` / `lunch` / `dinner` (jsonb: món + khẩu phần + dinh dưỡng).
- RLS: **phải đăng nhập mới thêm được** (`user_id` = chính mình); chủ xem được danh sách của mình; không ai
  sửa / xoá; khách không đọc thẳng bảng. Ai có link xem 1 thực đơn qua hàm `get_meal_plan(plan_id)`.
- Khách vẫn tạo & xem gợi ý; bấm lưu → lưu tạm vào `sessionStorage` rồi sang `/dang-nhap?next=/tao-thuc-don`,
  đăng nhập xong tự khôi phục bước 3. Bước 1 tự điền từ hồ sơ.
- Cache Components: mọi chỗ đọc phiên đăng nhập (cookie) phải nằm trong `<Suspense>`; không đọc cookie trong `'use cache'`.
- Cài đặt Supabase cần có: Authentication → URL Configuration (Site URL + Redirect URLs gồm web chính,
  `https://*-sol-04.vercel.app/**`, `http://localhost:3000/**`). Email mặc định của Supabase chỉ gửi tới thành viên
  project → tạm tắt "Confirm email" hoặc gắn SMTP riêng.
- id được tạo ở máy chủ (`crypto.randomUUID()`) trước khi insert, vì không được đọc lại bảng.
- Server action tự tính lại calo từ dữ liệu Sanity, không tin số liệu từ trình duyệt.
- `user_input` là thông tin cá nhân → trang `/thuc-don/[id]` đặt `noindex`.
- Đổi cấu trúc bảng: sửa `supabase/schema.sql` và nhắc chủ dự án chạy lại trong SQL Editor.

## Biến môi trường
- `NEXT_PUBLIC_SANITY_PROJECT_ID`, `NEXT_PUBLIC_SANITY_DATASET` — công khai, cần cả trên Vercel.
- `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY` — công khai (anon key), cần cả trên Vercel.
  Tuyệt đối không dùng `service_role` key trong web.
- `SANITY_API_WRITE_TOKEN` — **BÍ MẬT**, chỉ dùng cho script nhập dữ liệu, không đưa lên Vercel.

## Lệnh thường dùng
- `npm install` — cài thư viện.
- `npm run dev` — chạy thử trên máy tại http://localhost:3000 (Studio ở /studio)
- `npm run build` — build để kiểm tra lỗi.
- `npm run lint` — kiểm tra lỗi cách viết code.
- `npm run import:recipes` — nhập toàn bộ món (tự nấu + ăn ngoài) vào Sanity (cần token ghi).

## Quy tắc giao diện
- Xem đầy đủ trong **`DESIGN.md`** (nguồn chuẩn duy nhất về giao diện — đổi màu/khối dùng chung thì cập nhật cả file đó).
- Tóm tắt: **tối giản êm dịu**, nhiều khoảng trắng; màu chính **xanh xô thơm** `brand-600 #3f7a5c`, nền **kem**
  `canvas #fdf6e3`, phụ **xanh nước** `aqua-*`, calo **đào** `accent-*`; font **Nunito**; bo góc 8/16/24px;
  bóng nhẹ `shadow-soft` / `shadow-lift`; chuyển động `animate-enter` / `stagger`; **icon Lucide (không emoji)**,
  luôn nền sáng (không `dark:`), không gradient, không vòng xoay "đang tải". Dùng lại khối trong `ui.tsx` /
  `form.tsx` / `icons.tsx`; điện thoại trước, kiểm tra ở 375px (không tràn ngang, nút ≥44px); chữ tiếng Việt có dấu.

## Chia việc theo model (tự động chuyển model)

Có 4 trợ lý (subagent) trong `.claude/agents/`, mỗi trợ lý chạy trên **model riêng**. Model chính giao việc cho đúng
trợ lý nên model được đổi **tự động theo từng việc**, chủ dự án không cần gõ lệnh.

| Trợ lý | Model | Vai | Được sửa file? |
|---|---|---|---|
| `kien-truc-su` | **Fable** | Việc rất lớn, nhiều bước: làm lại cả luồng, đổi cấu trúc dữ liệu Sanity + Supabase → trả về kế hoạch | Không |
| `kiem-tra-vien` | **Opus** | Review trước khi push: bảo mật, calo / khẩu phần, dữ liệu dinh dưỡng, lỗi khó | Không |
| `tho-giao-dien` | **Sonnet** | Việc hằng ngày: giao diện theo DESIGN.md, thêm món vào `data/`, sửa lỗi build, tài liệu | Có (lint + build trước khi báo xong) |
| `tro-ly-nhanh` | **Haiku** | Việc nhỏ, lặp lại: tìm file, đọc kết quả lint / build, đếm / rà dữ liệu, trích thông tin hàng loạt | Không |

**Quy trình chuẩn cho mỗi yêu cầu:**
1. **Model chính** (thường là Opus) nhận yêu cầu, chia việc. Việc rất lớn → hỏi `kien-truc-su` lấy kế hoạch trước.
2. Tìm kiếm / rà dữ liệu → `tro-ly-nhanh`; làm giao diện / dữ liệu / tài liệu → `tho-giao-dien`. Việc độc lập chạy song song.
3. Trước khi push → `kiem-tra-vien` review phần đã đổi (**bắt buộc** nếu đụng `src/lib/meal-plan.ts`, `data/`, đăng nhập, Supabase).
4. Model chính tự xem lại, build, push, tạo PR và báo chủ dự án **việc nào do model nào làm**.
- Không chắc thì chọn trợ lý mạnh hơn một bậc. Fable không dùng được (tài khoản chưa bật) → dùng Opus thay. Việc quá nhỏ (vài dòng) model chính tự làm cho nhanh.
- Không trợ lý nào được push / tạo PR; mọi trợ lý phải theo CLAUDE.md + DESIGN.md, không đưa key bí mật vào code.
- Muốn đổi **model của cuộc trò chuyện chính**: chủ dự án gõ lệnh `/model` (chỉ chủ dự án làm được).

## Cách làm việc với chủ dự án (QUAN TRỌNG)
Chủ dự án **không biết code**. Vì vậy luôn:
1. **Giải thích đơn giản** bằng tiếng Việt, tránh thuật ngữ; nếu phải dùng thì giải thích ngắn.
2. **Làm từng bước nhỏ**, mỗi bước nói rõ đang làm gì và vì sao.
3. **Chạy `npm run build` để kiểm tra lỗi trước mỗi lần push.** Nếu build lỗi thì sửa
   xong mới push, và báo lại cho chủ dự án.
4. **Không bao giờ đưa key bí mật vào code** (API key, token, mật khẩu của Sanity,
   Supabase, Vercel...). Key chỉ để trong file `.env.local` (đã bị git bỏ qua) hoặc
   trong phần Environment Variables của Vercel. Chỉ ghi **tên biến** vào `.env.example`.
   - Lưu ý: biến có tiền tố `NEXT_PUBLIC_` sẽ hiển thị công khai trên trình duyệt —
     không dùng tiền tố này cho key bí mật (ví dụ Supabase service role key).

## Tiến độ hiện tại (cập nhật cuối mỗi phiên — đọc mục này trước tiên)
- **Đã xong và đã gộp vào `main` (PR #11, #12):** Nhật ký ăn uống + tập luyện (`/nhat-ky`), 12 món phụ, đổi tên hiển thị "Glow up with me", ô tìm kiếm không dấu ở `/mon-an`.
  - Web chính tự cập nhật trên Vercel sau khi gộp.
  - Việc mới → tạo nhánh mới từ `main` mới nhất → PR → gửi link preview (lấy từ bình luận của vercel[bot] trên PR) → chủ dự án nói "đồng ý gộp" thì mới gộp.
- **Việc chủ dự án tự làm:** bật "Leaked password protection" trong Supabase → Authentication.
- **Nhánh `claude/loving-feynman-t7q1zt` (chưa gộp):** tab Sức khoẻ (nhập file Apple Sức khoẻ: bước chân, năng lượng hoạt động, chu kỳ) + web app PWA.
  Chủ dự án cần chạy `supabase/migrations/20261106_suc_khoe.sql` trong Supabase thì tab Sức khoẻ mới lưu được.
- **Chưa làm (chỉ làm khi được yêu cầu lại):** cân nặng theo ngày, uống nước, giấc ngủ, dashboard, báo cáo tuần, tự đồng bộ Google Health / Fitbit.
- **Mã định danh** (không phải bí mật):
  - Supabase project `vxuapnicjqyvwzicdkmv`; SQL đã chạy nằm trong `supabase/migrations/`.
  - Vercel project `prj_xjDlVUwKwhQvaXSMfkD55EFaeJxc`, team `team_qpHDwMKTyBVTo2sImPR3GE15`. Công cụ Vercel có thể báo 403 → lấy link preview từ bình luận của vercel[bot] trên PR.
- **Tiết kiệm token:**
  - Chỉ đọc file liên quan đến việc được giao, không quét cả dự án.
  - Không đọc DESIGN.md trừ khi làm giao diện mới.
  - Việc nhỏ (1–2 file) thì tự làm, không gọi trợ lý.
  - Cuối phiên cập nhật lại mục này cho ngắn gọn.
