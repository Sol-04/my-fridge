// Thông tin kết nối Sanity, đọc từ biến môi trường (KHÔNG ghi giá trị thật vào code).
// Đặt giá trị trong .env.local (trên máy) hoặc Environment Variables (Vercel).
export const apiVersion = "2025-02-19";

export const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID ?? "";
export const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET ?? "production";

if (!projectId && process.env.NODE_ENV !== "production") {
  console.warn(
    "Chưa có NEXT_PUBLIC_SANITY_PROJECT_ID — xem hướng dẫn trong .env.example",
  );
}
