import { LoadingLabel, Skeleton } from "@/components/ui";

// Hiện trong lúc đang tải danh sách món
export default function Loading() {
  return (
    <main className="mx-auto w-full max-w-5xl px-4 py-8 sm:py-12">
      <Skeleton className="h-4 w-24" />
      <Skeleton className="mt-2 h-9 w-40" />
      <div className="mt-4">
        <LoadingLabel>Đang tải món ăn…</LoadingLabel>
      </div>
      <div className="mt-4 flex gap-2">
        {[0, 1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-12 w-24 rounded-2xl" />
        ))}
      </div>
      <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {[0, 1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="overflow-hidden rounded-3xl border border-line bg-white">
            <Skeleton className="aspect-[16/10] w-full rounded-none" />
            <div className="space-y-3 p-4">
              <Skeleton className="h-5 w-3/4" />
              <Skeleton className="h-7 w-1/2 rounded-full" />
            </div>
          </div>
        ))}
      </div>
    </main>
  );
}
