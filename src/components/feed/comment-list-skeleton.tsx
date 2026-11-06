import { Skeleton } from "@/components/ui/skeleton";

export function CommentListSkeleton({ count = 4 }: { count?: number }) {
  return (
    <ul className="space-y-4 py-1" aria-busy="true" aria-label="Loading comments">
      {Array.from({ length: count }, (_, index) => (
        <li key={index} className="flex items-start gap-3">
          <Skeleton className="h-9 w-9 shrink-0 rounded-full" />
          <div className="min-w-0 flex-1 space-y-2 pt-0.5">
            <div className="flex items-center gap-2">
              <Skeleton className="h-3.5 w-28" />
              <Skeleton className="h-3 w-10" />
            </div>
            <Skeleton className="h-3.5 w-full max-w-md" />
            <Skeleton className="h-3.5 w-[85%] max-w-sm" />
            <Skeleton className="mt-1 h-8 w-24 rounded-md" />
          </div>
        </li>
      ))}
    </ul>
  );
}
