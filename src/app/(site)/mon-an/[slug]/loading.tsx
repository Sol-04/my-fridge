import { LoadingLabel, Skeleton } from "@/components/ui";

// Hiện trong lúc đang tải chi tiết món
export default function Loading() {
  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-6 sm:py-10">
      <LoadingLabel>Đang tải công thức…</LoadingLabel>
      <Skeleton className="mt-3 aspect-[16/10] w-full rounded-3xl" />
      <Skeleton className="mt-5 h-7 w-40 rounded-full" />
      <Skeleton className="mt-3 h-9 w-4/5" />
      <Skeleton className="mt-2 h-5 w-full" />
      <Skeleton className="mt-8 h-48 w-full rounded-2xl" />
      <Skeleton className="mt-8 h-64 w-full rounded-2xl" />
    </main>
  );
}
