import Link from "next/link";

export default function Home() {
  return (
    <main className="flex flex-1 flex-col items-center justify-center px-4 py-16 text-center">
      <h1 className="text-4xl font-bold tracking-tight text-emerald-700 sm:text-5xl">
        My Fridge
      </h1>
      <p className="mt-4 max-w-md text-base text-zinc-600 sm:text-lg dark:text-zinc-300">
        Chọn thực phẩm bạn đang có, nhận ngay thực đơn sáng – trưa – tối vừa đủ
        calo để kiểm soát cân nặng.
      </p>
      <Link
        href="/mon-an"
        className="mt-8 inline-flex min-h-12 items-center rounded-full bg-emerald-600 px-6 font-semibold text-white shadow-sm transition hover:bg-emerald-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-600"
      >
        Xem món ăn
      </Link>
    </main>
  );
}
