import type { MetadataRoute } from "next";

// Khai báo để điện thoại cho "Cài ứng dụng" / "Thêm vào màn hình chính" (chạy toàn màn hình như app).
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Glow up with me",
    short_name: "Glow up",
    description: "Chọn thực phẩm đang có để nhận thực đơn sáng, trưa, tối vừa đủ calo; ghi nhật ký ăn tập.",
    lang: "vi",
    start_url: "/",
    scope: "/",
    display: "standalone",
    orientation: "portrait",
    background_color: "#fdf6e3",
    theme_color: "#3f7a5c",
    categories: ["health", "food", "lifestyle"],
    icons: [
      { src: "/icons/icon-192.png", sizes: "192x192", type: "image/png", purpose: "any" },
      { src: "/icons/icon-512.png", sizes: "512x512", type: "image/png", purpose: "any" },
      { src: "/icons/icon-maskable-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
    shortcuts: [
      { name: "Tạo thực đơn", url: "/tao-thuc-don", icons: [{ src: "/icons/icon-192.png", sizes: "192x192" }] },
      { name: "Nhật ký", url: "/nhat-ky", icons: [{ src: "/icons/icon-192.png", sizes: "192x192" }] },
    ],
  };
}
