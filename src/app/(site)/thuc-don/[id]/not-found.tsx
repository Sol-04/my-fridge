import { ButtonLink, EmptyState } from "@/components/ui";
import { Icons } from "@/components/icons";

// Hiện khi mở link thực đơn không tồn tại.
export default function MealPlanNotFound() {
  return (
    <main className="mx-auto w-full max-w-md flex-1 px-4 py-12">
      <EmptyState
        icon={Icons.plan}
        title="Không tìm thấy thực đơn"
        action={<ButtonLink href="/tao-thuc-don">Tạo thực đơn mới</ButtonLink>}
      >
        Link có thể bị sai hoặc thiếu ký tự. Hãy kiểm tra lại link được gửi cho bạn.
      </EmptyState>
    </main>
  );
}
