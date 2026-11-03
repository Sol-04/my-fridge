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
      <div className="mt-8 flex w-full max-w-xs flex-col gap-3 sm:max-w-none sm:flex-row sm:justify-center">
        <Link
          href="/tao-thuc-don"
          className="inline-flex min-h-12 items-center justify-center rounded-full bg-emerald-600 px-6 font-semibold text-white shadow-sm transition hover:bg-emerald-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-600"
        >
          Tạo thực đơn
        </Link>
        <Link
          href="/mon-an"
          className="inline-flex min-h-12 items-center justify-center rounded-full border border-emerald-600 px-6 font-semibold text-emerald-700 transition hover:bg-emerald-50 dark:hover:bg-emerald-950"
        >
          Xem món ăn
        </Link>
      </div>
    </main>
  );
}
