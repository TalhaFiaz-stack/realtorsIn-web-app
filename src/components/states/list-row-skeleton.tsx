import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

/** Avatar + two text lines — matches PersonRow / conversation / notification rows. */
export function ListRowSkeleton({
  count = 6,
  withAction = false,
  className,
  label = "Loading",
}: {
  count?: number;
  withAction?: boolean;
  className?: string;
  label?: string;
}) {
  return (
    <ul
      className={cn("divide-y divide-border", className)}
      aria-busy
      aria-label={label}
    >
      {Array.from({ length: count }).map((_, index) => (
        <li key={index} className="flex items-center gap-3 px-3 py-3">
          <Skeleton className="h-11 w-11 shrink-0 rounded-full" />
          <div className="min-w-0 flex-1 space-y-2">
            <Skeleton className="h-3.5 w-36 max-w-[70%]" />
            <Skeleton className="h-3 w-48 max-w-[90%]" />
          </div>
          {withAction ? (
            <Skeleton className="h-8 w-20 shrink-0 rounded-md" />
          ) : (
            <Skeleton className="h-3 w-10 shrink-0" />
          )}
        </li>
      ))}
    </ul>
  );
}

export function ConversationsListSkeleton({ count = 8 }: { count?: number }) {
  return (
    <ListRowSkeleton
      count={count}
      label="Loading conversations"
      className="bg-card"
    />
  );
}

export function NotificationsListSkeleton({ count = 6 }: { count?: number }) {
  return (
    <div className="space-y-3" aria-busy aria-label="Loading notifications">
      <div className="flex items-center justify-between px-1">
        <Skeleton className="h-4 w-20" />
        <Skeleton className="h-8 w-28 rounded-md" />
      </div>
      <ListRowSkeleton count={count} label="Loading notifications" />
    </div>
  );
}

export function NetworkPeopleSkeleton({ count = 6 }: { count?: number }) {
  return (
    <div
      className="overflow-hidden rounded-[var(--radius)] border border-border bg-card shadow-sm"
      aria-busy
      aria-label="Loading network"
    >
      <ListRowSkeleton count={count} withAction label="Loading people" />
    </div>
  );
}

export function NetworkPageSkeleton() {
  return (
    <div
      className="mx-auto w-full max-w-[var(--shell-wide-max)] space-y-5"
      aria-busy
      aria-label="Loading network"
    >
      <div className="space-y-2 px-1">
        <Skeleton className="h-7 w-28" />
        <Skeleton className="h-4 w-64 max-w-full" />
      </div>
      <Skeleton className="h-10 w-full rounded-md" />
      <Skeleton className="h-10 w-full rounded-md" />
      <NetworkPeopleSkeleton count={5} />
    </div>
  );
}

export function ChatThreadSkeleton() {
  return (
    <div
      className="flex min-h-0 flex-1 flex-col overflow-hidden"
      aria-busy
      aria-label="Loading chat"
    >
      <div className="flex shrink-0 items-center gap-3 border-b border-border px-4 py-3">
        <Skeleton className="h-9 w-9 rounded-full" />
        <div className="flex-1 space-y-2">
          <Skeleton className="h-3.5 w-32" />
          <Skeleton className="h-3 w-16" />
        </div>
      </div>
      <div className="flex min-h-0 flex-1 flex-col justify-end gap-3 overflow-hidden px-4 py-4">
        <div className="flex justify-start">
          <Skeleton className="h-12 w-[55%] max-w-xs rounded-2xl rounded-bl-md" />
        </div>
        <div className="flex justify-end">
          <Skeleton className="h-10 w-[45%] max-w-xs rounded-2xl rounded-br-md" />
        </div>
        <div className="flex justify-start">
          <Skeleton className="h-16 w-[62%] max-w-sm rounded-2xl rounded-bl-md" />
        </div>
        <div className="flex justify-end">
          <Skeleton className="h-10 w-[38%] max-w-xs rounded-2xl rounded-br-md" />
        </div>
        <div className="flex justify-start">
          <Skeleton className="h-11 w-[48%] max-w-xs rounded-2xl rounded-bl-md" />
        </div>
      </div>
      <div className="flex shrink-0 items-center gap-2 border-t border-border px-3 py-3">
        <Skeleton className="h-10 w-10 rounded-full" />
        <Skeleton className="h-10 flex-1 rounded-full" />
        <Skeleton className="h-10 w-10 rounded-full" />
      </div>
    </div>
  );
}

export function MessagesPageSkeleton() {
  return (
    <div
      className="flex h-full min-h-0 w-full gap-4"
      aria-busy
      aria-label="Loading messages"
    >
      <div className="flex min-h-0 min-w-0 flex-1 overflow-hidden rounded-lg border border-border bg-card">
        <section className="flex w-full flex-col md:w-[var(--rail-width)] md:shrink-0 md:border-r md:border-border">
          <div className="border-b border-border px-4 py-3">
            <Skeleton className="h-5 w-24" />
          </div>
          <div className="min-h-0 flex-1 overflow-hidden">
            <ConversationsListSkeleton />
          </div>
        </section>
        <section className="hidden min-h-0 min-w-0 flex-1 md:flex">
          <ChatThreadSkeleton />
        </section>
      </div>
    </div>
  );
}

export function SearchAccountsSkeleton({ count = 6 }: { count?: number }) {
  return (
    <NetworkPeopleSkeleton count={count} />
  );
}
