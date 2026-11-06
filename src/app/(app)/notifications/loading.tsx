import { NotificationsListSkeleton } from "@/components/states/list-row-skeleton";
import { Skeleton } from "@/components/ui/skeleton";

export default function NotificationsLoading() {
  return (
    <div className="mx-auto w-full max-w-2xl space-y-3 pb-6">
      <header className="space-y-2 px-1">
        <Skeleton className="h-7 w-40" />
        <Skeleton className="h-4 w-56 max-w-full" />
      </header>
      <NotificationsListSkeleton />
    </div>
  );
}
