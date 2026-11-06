import { LoadingLabel, Skeleton } from "@/components/ui";

// Hiện trong lúc đang tải nhật ký
export default function DiaryLoading() {
  return (
    <main className="mx-auto w-full max-w-2xl space-y-5 px-4 py-8 sm:py-12">
      <div className="space-y-2">
        <Skeleton className="h-4 w-20" />
        <Skeleton className="h-9 w-56" />
        <Skeleton className="h-5 w-64" />
      </div>
      <Skeleton className="h-14 w-full rounded-2xl" />
      <Skeleton className="h-12 w-full rounded-2xl" />
      <LoadingLabel>Đang tải nhật ký…</LoadingLabel>
      <Skeleton className="h-44 w-full rounded-3xl" />
      <Skeleton className="h-32 w-full rounded-3xl" />
      <Skeleton className="h-32 w-full rounded-3xl" />
    </main>
  );
}
