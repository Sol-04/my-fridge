import Link from "next/link";

import { Icon, Icons } from "@/components/icons";

// Footer: liên kết nhanh + lưu ý sức khoẻ.
export function SiteFooter() {
  return (
    <footer className="mt-16 border-t border-line bg-white">
      <div className="mx-auto w-full max-w-5xl px-4 py-10 sm:px-6">
        <div className="flex gap-3 rounded-2xl bg-aqua-50 p-4 text-sm leading-relaxed text-brand-900">
          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white text-aqua-800">
            <Icon icon={Icons.health} size={18} />
          </span>
          <div>
          <p className="pt-1 font-semibold">Lưu ý sức khoẻ</p>
          <p className="mt-1">
            Lượng calo và dinh dưỡng trên My Fridge chỉ là <strong>ước tính tham khảo</strong>, không thay thế lời
            khuyên của bác sĩ hay chuyên gia dinh dưỡng. Nếu bạn đang mang thai, cho con bú, dưới 18 tuổi, có bệnh
            lý (tiểu đường, tim mạch, thận…) hoặc muốn giảm cân nhanh, hãy hỏi ý kiến chuyên gia trước khi thay đổi
            chế độ ăn.
          </p>
          </div>
        </div>

        <div className="mt-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <p className="flex items-center gap-2 font-bold text-brand-700">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-600 text-white">
              <Icon icon={Icons.logo} size={18} />
            </span>
            My Fridge
          </p>
          <nav aria-label="Liên kết cuối trang" className="flex flex-wrap gap-x-2 text-sm">
            <Link href="/" className="inline-flex min-h-11 items-center px-2 text-muted transition-colors duration-200 hover:text-brand-700">
              Trang chủ
            </Link>
            <Link href="/mon-an" className="inline-flex min-h-11 items-center px-2 text-muted transition-colors duration-200 hover:text-brand-700">
              Món ăn
            </Link>
            <Link href="/tao-thuc-don" className="inline-flex min-h-11 items-center px-2 text-muted transition-colors duration-200 hover:text-brand-700">
              Tạo thực đơn
            </Link>
          </nav>
        </div>
        <p className="mt-4 text-xs text-muted">© 2026 My Fridge · Nấu ngon từ những gì bạn đang có.</p>
      </div>
    </footer>
  );
}
