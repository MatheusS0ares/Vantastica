import { Skeleton } from "@/components/ui/skeleton";

export default function LoadingTurnos() {
  return (
    <div className="flex flex-1 flex-col gap-4 px-5 py-6">
      <div className="flex items-center justify-between">
        <Skeleton className="h-7 w-40" />
        <Skeleton className="h-4 w-14" />
      </div>

      <div className="flex gap-2">
        <Skeleton className="h-9 flex-1 rounded-pill" />
        <Skeleton className="h-9 flex-1 rounded-pill" />
        <Skeleton className="h-9 flex-1 rounded-pill" />
      </div>

      {[0, 1, 2].map((i) => (
        <Skeleton key={i} className="h-24 w-full rounded-card" />
      ))}
    </div>
  );
}
