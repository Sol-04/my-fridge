import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";
import { ButtonLink, EmptyState } from "@/components/ui";

// Trang 404 chung: khi mở đường dẫn không tồn tại.
export default function NotFound() {
  return (
    <>
      <SiteHeader />
      <main className="mx-auto w-full max-w-md flex-1 px-4 py-12">
        <EmptyState
          icon="🧭"
          title="Không tìm thấy trang"
          action={
            <div className="flex flex-col gap-3 sm:flex-row">
              <ButtonLink href="/">Về trang chủ</ButtonLink>
              <ButtonLink href="/tao-thuc-don" variant="secondary">
                Tạo thực đơn
              </ButtonLink>
            </div>
          }
        >
          Đường dẫn có thể bị gõ sai hoặc trang đã được chuyển đi chỗ khác.
        </EmptyState>
      </main>
      <SiteFooter />
    </>
  );
}
