import { LoadingLabel, Skeleton } from "@/components/ui";

// Hiện trong lúc đang tải hồ sơ
export default function ProfileLoading() {
  return (
    <main className="mx-auto w-full max-w-2xl space-y-5 px-4 py-8 sm:py-12">
      <div className="flex items-center gap-4">
        <Skeleton className="h-16 w-16 rounded-full" />
        <div className="flex-1 space-y-2">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-7 w-48" />
        </div>
      </div>
      <LoadingLabel>Đang tải hồ sơ…</LoadingLabel>
      <Skeleton className="h-96 w-full rounded-3xl" />
      <Skeleton className="h-48 w-full rounded-3xl" />
    </main>
  );
}
