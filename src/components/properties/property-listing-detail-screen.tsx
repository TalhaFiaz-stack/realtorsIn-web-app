"use client";

import { useSearchParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { PropertyListingDetailActions } from "@/components/properties/property-listing-detail-actions";
import { PropertyListingDetailView } from "@/components/properties/property-listing-detail-view";
import { PropertyListingStatusControl } from "@/components/properties/property-listing-status-control";
import { ShellBackRow } from "@/components/navigation/shell-back-row";
import { OffPlanPillBackLink } from "@/components/listings/off-plan-pill-back-link";
import { ErrorState } from "@/components/states/error-state";
import { PropertyListingDetailSkeleton } from "@/components/properties/property-list-shimmers";
import { Skeleton } from "@/components/ui/skeleton";
import { fetchPropertyDetailRequest } from "@/features/properties/services/properties.client";
import { propertiesErrorMessage } from "@/features/properties/hooks/use-property-hub";
import { normalizeRemPropertyId } from "@/features/properties/lib/normalize-rem-property-id";

export function PropertyListingDetailScreen({
  listingRowId,
}: {
  listingRowId: number;
}) {
  const searchParams = useSearchParams();
  const type = searchParams.get("type") ?? undefined;
  const remRaw = searchParams.get("remPropertyId");
  const remPropertyId = normalizeRemPropertyId(remRaw);

  const query = useQuery({
    queryKey: ["properties", "detail", listingRowId, type, remRaw],
    queryFn: ({ signal }) =>
      fetchPropertyDetailRequest(
        listingRowId,
        { type, remPropertyId },
        signal
      ),
    select: (data) => data.listing,
    enabled: Number.isFinite(listingRowId) && listingRowId > 0,
  });

  const listing = query.data;
  const actionCard = listing ? (
    <PropertyListingDetailActions
      listing={listing}
      statusControl={
        <PropertyListingStatusControl
          listing={listing}
          remQueryRaw={remRaw ?? undefined}
          size="sm"
        />
      }
    />
  ) : null;

  return (
    <div className="w-full max-w-5xl pb-10">
      <ShellBackRow className="mb-4">
        <OffPlanPillBackLink href="/properties">Properties</OffPlanPillBackLink>
      </ShellBackRow>

      {query.isLoading ? (
        <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_20rem]">
          <div className="space-y-4">
            <PropertyListingDetailSkeleton />
          </div>
          <div className="space-y-3 rounded-2xl border border-border bg-card p-5 shadow-sm">
            <Skeleton className="h-3 w-20" />
            <Skeleton className="h-8 w-40" />
            <Skeleton className="h-11 w-full rounded-full" />
            <Skeleton className="h-10 w-full rounded-full" />
          </div>
        </div>
      ) : query.isError ? (
        <ErrorState
          title="Unable to load listing"
          description={propertiesErrorMessage(query.error)}
          onRetry={() => void query.refetch()}
        />
      ) : listing ? (
        <div className="grid items-start gap-4 lg:grid-cols-[minmax(0,1fr)_20rem]">
          <div className="min-w-0">
            <PropertyListingDetailView
              listing={listing}
              afterHeader={<div className="lg:hidden">{actionCard}</div>}
            />
          </div>
          <aside className="hidden lg:sticky lg:top-[4.5rem] lg:block">{actionCard}</aside>
        </div>
      ) : null}
    </div>
  );
}
