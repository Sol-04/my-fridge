import { LoadingLabel, Skeleton } from "@/components/ui";

// Hiện trong lúc đang chuẩn bị trang tạo thực đơn
export default function Loading() {
  return (
    <main className="mx-auto w-full max-w-2xl px-4 pt-8 sm:pt-12">
      <Skeleton className="h-4 w-40" />
      <Skeleton className="mt-2 h-9 w-48" />
      <div className="mt-4">
        <LoadingLabel>Đang chuẩn bị…</LoadingLabel>
      </div>
      <Skeleton className="mt-6 h-20 w-full rounded-3xl" />
      <div className="mt-6 space-y-4">
        <Skeleton className="h-12 w-full rounded-2xl" />
        <Skeleton className="h-14 w-full rounded-2xl" />
        <Skeleton className="h-14 w-full rounded-2xl" />
        <Skeleton className="h-14 w-full rounded-2xl" />
      </div>
    </main>
  );
}
