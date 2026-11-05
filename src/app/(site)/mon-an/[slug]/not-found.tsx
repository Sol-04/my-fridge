import { ButtonLink, EmptyState } from "@/components/ui";
import { Icons } from "@/components/icons";

// Hiện khi mở một món không có trong Sanity.
export default function RecipeNotFound() {
  return (
    <main className="mx-auto w-full max-w-md flex-1 px-4 py-12">
      <EmptyState
        icon={Icons.notFound}
        title="Không tìm thấy món này"
        action={<ButtonLink href="/mon-an">Xem tất cả món</ButtonLink>}
      >
        Món ăn có thể đã bị xoá hoặc đường dẫn bị sai.
      </EmptyState>
    </main>
  );
}
