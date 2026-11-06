import { Skeleton } from "@/components/ui/skeleton";

export default function MeLoading() {
  return (
    <div
      className="w-full space-y-3 pb-6"
      aria-busy
      aria-label="Loading profile"
    >
      <div className="overflow-hidden rounded-[var(--radius)] border border-border bg-card shadow-sm">
        <Skeleton className="h-40 w-full rounded-none sm:h-52" />
        <div className="space-y-3 px-4 pb-4 pt-0">
          <Skeleton className="-mt-12 h-24 w-24 rounded-full border-4 border-card" />
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-16 w-full" />
        </div>
      </div>
      <Skeleton className="h-28 w-full rounded-[var(--radius)]" />
      <Skeleton className="h-64 w-full rounded-[var(--radius)]" />
    </div>
  );
}
