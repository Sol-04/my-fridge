import Link from "next/link";

// Footer: liên kết nhanh + lưu ý sức khoẻ.
export function SiteFooter() {
  return (
    <footer className="mt-16 border-t border-brand-100 bg-white">
      <div className="mx-auto w-full max-w-5xl px-4 py-8">
        <div className="rounded-2xl bg-brand-50 p-4 text-sm leading-relaxed text-brand-900">
          <p className="font-semibold">🩺 Lưu ý sức khoẻ</p>
          <p className="mt-1">
            Lượng calo và dinh dưỡng trên My Fridge chỉ là <strong>ước tính tham khảo</strong>, không thay thế lời
            khuyên của bác sĩ hay chuyên gia dinh dưỡng. Nếu bạn đang mang thai, cho con bú, dưới 18 tuổi, có bệnh
            lý (tiểu đường, tim mạch, thận…) hoặc muốn giảm cân nhanh, hãy hỏi ý kiến chuyên gia trước khi thay đổi
            chế độ ăn.
          </p>
        </div>

        <div className="mt-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <p className="flex items-center gap-2 font-bold text-brand-700">
            <span aria-hidden>🥬</span> My Fridge
          </p>
          <nav aria-label="Liên kết cuối trang" className="flex flex-wrap gap-x-2 text-sm">
            <Link href="/" className="inline-flex min-h-11 items-center px-2 text-muted hover:text-brand-700">
              Trang chủ
            </Link>
            <Link href="/mon-an" className="inline-flex min-h-11 items-center px-2 text-muted hover:text-brand-700">
              Món ăn
            </Link>
            <Link href="/tao-thuc-don" className="inline-flex min-h-11 items-center px-2 text-muted hover:text-brand-700">
              Tạo thực đơn
            </Link>
          </nav>
        </div>
        <p className="mt-4 text-xs text-muted">© 2026 My Fridge · Nấu ngon từ những gì bạn đang có.</p>
      </div>
    </footer>
  );
}
