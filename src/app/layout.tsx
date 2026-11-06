import type { Metadata, Viewport } from "next";
import { Nunito } from "next/font/google";
import "./globals.css";

// Nunito: chữ tròn, mềm, hỗ trợ đầy đủ tiếng Việt
const nunito = Nunito({
  variable: "--font-nunito",
  subsets: ["latin", "vietnamese"],
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "Glow up with me – Thực đơn từ tủ lạnh của bạn",
  description:
    "Có sẵn đồ trong tủ lạnh mà không biết nấu gì? Chọn thực phẩm đang có để nhận thực đơn sáng, trưa, tối vừa đủ calo.",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#3f7a5c",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="vi" className={`${nunito.variable} antialiased`}>
      <body className="flex min-h-dvh flex-col font-sans">{children}</body>
    </html>
  );
}
