import Link from "next/link";

// Hiện khi mở một món không có trong Sanity.
export default function RecipeNotFound() {
  return (
    <main className="mx-auto flex w-full max-w-md flex-1 flex-col items-center justify-center px-4 py-16 text-center">
      <p className="text-5xl" aria-hidden>
        🍽️
      </p>
      <h1 className="mt-4 text-2xl font-bold text-zinc-900 dark:text-zinc-100">Không tìm thấy món này</h1>
      <p className="mt-2 text-zinc-600 dark:text-zinc-400">
        Món ăn có thể đã bị xoá hoặc đường dẫn bị sai.
      </p>
      <Link
        href="/mon-an"
        className="mt-6 inline-flex min-h-12 items-center rounded-full bg-emerald-600 px-6 font-semibold text-white hover:bg-emerald-700"
      >
        Xem tất cả món
      </Link>
    </main>
  );
}
