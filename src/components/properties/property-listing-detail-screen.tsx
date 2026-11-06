"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { PropertyListingDetailActions } from "@/components/properties/property-listing-detail-actions";
import { PropertyListingShare } from "@/components/properties/property-listing-share";
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

  return (
    <div className="w-full max-w-2xl space-y-5 pb-10">
      <header className="space-y-4">
        <ShellBackRow>
          <OffPlanPillBackLink href="/properties">Properties</OffPlanPillBackLink>
        </ShellBackRow>

        {query.isLoading ? (
          <div className="space-y-2 px-0.5">
            <Skeleton className="h-7 w-3/4" />
            <Skeleton className="h-4 w-24" />
          </div>
        ) : listing ? (
          <div className="space-y-1 px-0.5">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <h1 className="locale-text min-w-0 flex-1 text-2xl font-semibold leading-snug tracking-tight text-foreground sm:text-[1.65rem]">
                {listing.title ?? "Listing"}
              </h1>
              <PropertyListingStatusControl
                listing={listing}
                remQueryRaw={remRaw ?? undefined}
                size="md"
              />
            </div>
          </div>
        ) : null}
      </header>

      {query.isLoading ? (
        <>
          <PropertyListingDetailSkeleton />
          <div className="rounded-xl border border-border bg-card p-4 shadow-sm">
            <Skeleton className="mb-3 h-3 w-28" />
            <Skeleton className="h-9 w-full max-w-xs" />
          </div>
        </>
      ) : query.isError ? (
        <ErrorState
          title="Unable to load listing"
          description={propertiesErrorMessage(query.error)}
          onRetry={() => void query.refetch()}
        />
      ) : listing ? (
        <>
          <PropertyListingDetailView listing={listing} />
          <div className="flex flex-wrap items-center gap-2">
            <PropertyListingShare listing={listing} />
          </div>
          <PropertyListingDetailActions listing={listing} />

          {listing.postId ? (
            <p className="px-0.5 text-sm">
              <Link
                href={`/posts/${listing.postId}`}
                className="font-medium text-primary hover:underline"
              >
                View feed post
              </Link>
            </p>
          ) : null}
        </>
      ) : null}
    </div>
  );
}
