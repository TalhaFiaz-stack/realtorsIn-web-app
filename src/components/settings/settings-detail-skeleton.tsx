import { ReferralHistoryListSkeleton } from "@/components/referral/referral-history-list-skeleton";
import { Skeleton } from "@/components/ui/skeleton";

export function SettingsPanelCardSkeleton() {
  return (
    <section
      className="rounded-lg border border-border bg-card p-4 shadow-sm"
      aria-hidden
    >
      <div className="flex gap-3">
        <Skeleton className="h-7 w-7 shrink-0 rounded-full" />
        <div className="min-w-0 flex-1 space-y-2">
          <Skeleton className="h-4 w-44 max-w-full" />
          <Skeleton className="h-3 w-full max-w-md" />
          <Skeleton className="h-3 w-[85%] max-w-sm" />
        </div>
      </div>
    </section>
  );
}

function ToggleRowSkeleton({ showDivider }: { showDivider?: boolean }) {
  return (
    <div
      className={
        showDivider ? "border-t border-border px-4 py-3" : "px-4 py-3"
      }
    >
      <div className="flex items-center justify-between gap-4">
        <div className="min-w-0 flex-1 space-y-2">
          <Skeleton className="h-4 w-36 max-w-full" />
          <Skeleton className="h-3 w-52 max-w-full" />
        </div>
        <Skeleton className="h-6 w-11 shrink-0 rounded-full" />
      </div>
    </div>
  );
}

export function SettingsToggleListSkeleton() {
  return (
    <div className="space-y-4" aria-busy aria-label="Loading notification settings">
      <SettingsPanelCardSkeleton />
      <div>
        <Skeleton className="mb-2 ml-1 h-3 w-14" />
        <div className="overflow-hidden rounded-lg border border-border bg-card shadow-sm">
          <ToggleRowSkeleton />
        </div>
      </div>
      {["Activity", "Messages"].map((key) => (
        <div key={key}>
          <Skeleton className="mb-2 ml-1 h-3 w-20" />
          <div className="overflow-hidden rounded-lg border border-border bg-card shadow-sm">
            {Array.from({ length: 3 }).map((_, index) => (
              <ToggleRowSkeleton key={index} showDivider={index > 0} />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

export function SettingsFormSkeleton() {
  return (
    <div className="space-y-4" aria-busy aria-label="Loading form">
      <section className="rounded-lg border border-border bg-card p-5 text-center shadow-sm">
        <Skeleton className="mx-auto h-12 w-12 rounded-full" />
        <Skeleton className="mx-auto mt-3 h-5 w-40" />
        <Skeleton className="mx-auto mt-2 h-4 w-full max-w-sm" />
      </section>
      <section className="space-y-4 rounded-lg border border-border bg-card p-4 shadow-sm">
        <div className="space-y-2">
          <Skeleton className="h-4 w-28" />
          <Skeleton className="h-10 w-full rounded-md" />
        </div>
        <div className="space-y-2">
          <Skeleton className="h-4 w-36" />
          <Skeleton className="h-10 w-full rounded-md" />
        </div>
        <Skeleton className="h-24 w-full rounded-md" />
        <Skeleton className="h-10 w-full rounded-md" />
      </section>
    </div>
  );
}

export function SettingsAppearanceSkeleton() {
  return (
    <div
      className="overflow-hidden rounded-lg border border-border bg-card p-2 shadow-sm"
      aria-busy
      aria-label="Loading appearance"
    >
      <Skeleton className="mx-2 my-2 h-3 w-full max-w-xs" />
      <div className="grid gap-1 sm:grid-cols-3">
        {Array.from({ length: 3 }).map((_, index) => (
          <Skeleton key={index} className="h-[5.5rem] rounded-md" />
        ))}
      </div>
    </div>
  );
}

export function SettingsAccountSkeleton() {
  return (
    <div className="space-y-4" aria-busy aria-label="Loading account settings">
      <section className="space-y-3 rounded-lg border border-border bg-card p-4 shadow-sm">
        <Skeleton className="h-4 w-32" />
        <Skeleton className="h-3 w-full max-w-md" />
        {Array.from({ length: 4 }).map((_, index) => (
          <Skeleton key={index} className="h-3 w-full max-w-lg" />
        ))}
        <Skeleton className="h-16 w-full rounded-lg" />
        <Skeleton className="h-16 w-full rounded-lg" />
      </section>
      <Skeleton className="h-14 w-full rounded-lg" />
    </div>
  );
}

export function InviteFriendsDetailSkeleton() {
  return (
    <div className="space-y-2" aria-busy aria-label="Loading invite program">
      <SettingsPanelCardSkeleton />
      <Skeleton className="h-5 w-28" />
      <ReferralHistoryListSkeleton count={2} />
      <SettingsPanelCardSkeleton />
      <Skeleton className="h-10 w-full rounded-md" />
    </div>
  );
}

export function BrokerVerificationDetailSkeleton() {
  return (
    <div className="space-y-2" aria-busy aria-label="Loading verification">
      <SettingsPanelCardSkeleton />
      <section className="space-y-4 rounded-lg border border-border bg-card p-4 shadow-sm">
        {Array.from({ length: 3 }).map((_, index) => (
          <div key={index} className="space-y-2">
            <Skeleton className="h-4 w-28" />
            <Skeleton className="h-9 w-32 rounded-md" />
          </div>
        ))}
        <Skeleton className="h-10 w-full rounded-md" />
        <Skeleton className="h-10 w-full max-w-xs rounded-md" />
      </section>
    </div>
  );
}
