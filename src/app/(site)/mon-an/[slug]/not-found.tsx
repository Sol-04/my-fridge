import { ButtonLink, EmptyState } from "@/components/ui";

// Hiện khi mở một món không có trong Sanity.
export default function RecipeNotFound() {
  return (
    <main className="mx-auto w-full max-w-md flex-1 px-4 py-12">
      <EmptyState
        icon="🍽️"
        title="Không tìm thấy món này"
        action={<ButtonLink href="/mon-an">Xem tất cả món</ButtonLink>}
      >
        Món ăn có thể đã bị xoá hoặc đường dẫn bị sai.
      </EmptyState>
    </main>
  );
}
