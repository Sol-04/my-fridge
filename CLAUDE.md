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
- `public/` — ảnh, icon tĩnh.
- `.env.example` — mẫu tên biến môi trường (KHÔNG chứa giá trị thật).

## Lệnh thường dùng
- `npm install` — cài thư viện.
- `npm run dev` — chạy thử trên máy tại http://localhost:3000
- `npm run build` — build để kiểm tra lỗi.
- `npm run lint` — kiểm tra lỗi cách viết code.

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
