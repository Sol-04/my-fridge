@AGENTS.md

# My Fridge

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
- `src/app/mon-an/` — trang danh sách món `/mon-an` (thẻ món + lọc theo bữa trong `RecipeList.tsx`).
- `src/app/mon-an/[slug]/` — trang chi tiết món (dinh dưỡng, nguyên liệu, các bước) + `not-found.tsx`.
- `src/app/studio/[[...tool]]/` — trang quản trị Sanity Studio tại `/studio`.
- `src/components/` — `RecipeCard.tsx` (thẻ món), `RecipeImage.tsx` (ảnh món, có ô thay thế khi chưa có ảnh).
- `src/sanity/` — kết nối Sanity: `env.ts` (đọc biến môi trường), `lib/client.ts` (đọc dữ liệu),
  `lib/image.ts` (link ảnh), `lib/queries.ts` (truy vấn GROQ), `lib/recipes.ts` (hàm lấy món,
  cache 1 giờ, lỗi thì trả rỗng chứ không làm sập web), `meals.ts` (nhãn bữa sáng/trưa/tối),
  `schemaTypes/recipe.ts` (loại nội dung "Món ăn").
  - Code của trang web KHÔNG import từ `schemaTypes/` (sẽ kéo cả gói Studio nặng vào trang).
- `sanity.config.ts`, `sanity.cli.ts` — cấu hình Studio và lệnh `npx sanity`.
- `data/nutrition.ts` — bảng dinh dưỡng /100 g, là **danh sách tên nguyên liệu chuẩn**.
- `data/recipes.ts` — 24 món mẫu; calo/đạm/tinh bột/béo được tính tự động từ số gram.
- `scripts/import-recipes.ts` — script nhập món vào Sanity.
- `public/` — ảnh, icon tĩnh.
- `.env.example` — mẫu tên biến môi trường (KHÔNG chứa giá trị thật).

## Sanity (công thức món ăn)
- Project ID `b4tnn0pq`, dataset `production` (dataset public: đọc không cần token).
- Loại nội dung `recipe` ("Món ăn"): `name`, `slug`, `image`, `description`,
  `meals` (`breakfast`/`lunch`/`dinner`), `ingredients[] {name, grams}`, `servingGrams`,
  `calories`, `protein`, `carbs`, `fat`, `cookMinutes`, `steps[]`.
- Mỗi món có ID cố định `recipe-<slug>` → nhập lại sẽ ghi đè, không trùng.
- Thêm món mới: thêm vào `data/recipes.ts` (chỉ dùng tên nguyên liệu có trong `data/nutrition.ts`),
  rồi chạy `npm run import:recipes`.
- Studio tại `/studio` cần thêm địa chỉ web vào CORS origins (sanity.io/manage → API).

## Biến môi trường
- `NEXT_PUBLIC_SANITY_PROJECT_ID`, `NEXT_PUBLIC_SANITY_DATASET` — công khai, cần cả trên Vercel.
- `SANITY_API_WRITE_TOKEN` — **BÍ MẬT**, chỉ dùng cho script nhập dữ liệu, không đưa lên Vercel.

## Lệnh thường dùng
- `npm install` — cài thư viện.
- `npm run dev` — chạy thử trên máy tại http://localhost:3000 (Studio ở /studio)
- `npm run build` — build để kiểm tra lỗi.
- `npm run lint` — kiểm tra lỗi cách viết code.
- `npm run import:recipes` — nhập món trong `data/recipes.ts` vào Sanity (cần token ghi).

## Quy tắc giao diện
- Toàn bộ chữ hiển thị cho người dùng bằng **tiếng Việt** (có dấu đầy đủ).
- **Ưu tiên mobile**: thiết kế cho màn hình điện thoại trước, sau đó mới mở rộng cho
  màn hình lớn (dùng tiền tố Tailwind `sm:`, `md:`, `lg:`).
- Nút bấm và vùng chạm đủ lớn (tối thiểu ~44px), chữ dễ đọc.

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
