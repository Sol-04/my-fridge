// Kết nối Supabase (nơi lưu thực đơn), đọc từ biến môi trường.
// KHÔNG ghi giá trị thật vào code. Dùng "anon key" công khai — tuyệt đối không dùng service_role key.
import { createClient, type SupabaseClient } from "@supabase/supabase-js";

let cached: SupabaseClient | null | undefined;

// Trả về null nếu chưa cấu hình, để trang báo lỗi nhẹ nhàng thay vì bị sập.
export function getSupabase(): SupabaseClient | null {
  if (cached !== undefined) return cached;
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !anonKey) {
    console.error("Chưa có NEXT_PUBLIC_SUPABASE_URL / NEXT_PUBLIC_SUPABASE_ANON_KEY — xem .env.example");
    cached = null;
    return cached;
  }
  try {
    cached = createClient(url, anonKey, {
      auth: { persistSession: false, autoRefreshToken: false },
    });
  } catch (err) {
    console.error("Không tạo được kết nối Supabase:", err instanceof Error ? err.message : err);
    cached = null;
  }
  return cached;
}
