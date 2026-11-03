import Link from "next/link";

// Hiện khi mở link thực đơn không tồn tại.
export default function MealPlanNotFound() {
  return (
    <main className="mx-auto flex w-full max-w-md flex-1 flex-col items-center justify-center px-4 py-16 text-center">
      <p className="text-5xl" aria-hidden>
        📋
      </p>
      <h1 className="mt-4 text-2xl font-bold text-zinc-900 dark:text-zinc-100">Không tìm thấy thực đơn</h1>
      <p className="mt-2 text-zinc-600 dark:text-zinc-400">Link có thể bị sai hoặc thiếu ký tự.</p>
      <Link
        href="/tao-thuc-don"
        className="mt-6 inline-flex min-h-12 items-center rounded-full bg-emerald-600 px-6 font-semibold text-white hover:bg-emerald-700"
      >
        Tạo thực đơn mới
      </Link>
    </main>
  );
}
