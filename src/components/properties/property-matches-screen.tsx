"use client";

import { useSearchParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { PropertyListingDetailView } from "@/components/properties/property-listing-detail-view";
import { PropertyMatchCard } from "@/components/properties/property-match-card";
import { ShellBackLink } from "@/components/navigation/shell-back-link";
import { ShellBackRow } from "@/components/navigation/shell-back-row";
import { EmptyState } from "@/components/states/empty-state";
import { ErrorState } from "@/components/states/error-state";
import {
  PropertyListingDetailSkeleton,
  PropertyListGridShimmer,
} from "@/components/properties/property-list-shimmers";
import { Skeleton } from "@/components/ui/skeleton";
import { propertiesErrorMessage } from "@/features/properties/hooks/use-property-hub";
import { normalizeRemPropertyId } from "@/features/properties/lib/normalize-rem-property-id";
import { propertyListingHref } from "@/features/properties/lib/property-listing-routes";
import { fetchListingMatchesRequest } from "@/features/properties/services/properties-mutations.client";
import { fetchPropertyDetailRequest } from "@/features/properties/services/properties.client";

export function PropertyMatchesScreen({
  listingRowId,
}: {
  listingRowId: number;
}) {
  const searchParams = useSearchParams();
  const type = searchParams.get("type") ?? undefined;
  const remRaw = searchParams.get("remPropertyId");
  const remPropertyId = normalizeRemPropertyId(remRaw);

  const ref = { listingRowId, type, remPropertyId };

  const sourceQuery = useQuery({
    queryKey: ["properties", "detail", listingRowId, type, remRaw],
    queryFn: ({ signal }) =>
      fetchPropertyDetailRequest(listingRowId, { type, remPropertyId }, signal),
    select: (data) => data.listing,
    enabled: Number.isFinite(listingRowId) && listingRowId > 0,
  });

  const matchesQuery = useQuery({
    queryKey: ["properties", "matches", listingRowId, type, remRaw],
    queryFn: ({ signal }) => fetchListingMatchesRequest(ref, signal),
    select: (data) => data.matches,
    enabled: Number.isFinite(listingRowId) && listingRowId > 0,
  });

  const source = sourceQuery.data;
  const backHref = source
    ? propertyListingHref(listingRowId, source)
    : "/properties";

  return (
    <div className="w-full max-w-2xl space-y-4 pb-10">
      <header className="space-y-3">
        <ShellBackRow>
          <ShellBackLink href={backHref} label="Listing" />
        </ShellBackRow>
        <div className="space-y-1 px-0.5">
          <h1 className="text-[22px] font-semibold tracking-tight">
            Find matches
          </h1>
          <p className="text-sm text-muted-foreground">
            Opposite-type active listings ranked by how well they match yours.
          </p>
        </div>
      </header>

      {sourceQuery.isLoading ? (
        <section className="space-y-2">
          <Skeleton className="h-4 w-28 px-0.5" />
          <PropertyListingDetailSkeleton />
        </section>
      ) : source ? (
        <section className="space-y-2">
          <h2 className="px-0.5 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Your listing
          </h2>
          <PropertyListingDetailView listing={source} />
        </section>
      ) : null}

      <section className="space-y-3">
        <h2 className="px-0.5 text-sm font-semibold tracking-tight">
          Top matches
        </h2>

        {matchesQuery.isLoading ? (
          <PropertyListGridShimmer
            count={4}
            showFooterAction
          />
        ) : matchesQuery.isError ? (
          <ErrorState
            title="Unable to load matches"
            description={propertiesErrorMessage(matchesQuery.error)}
            onRetry={() => void matchesQuery.refetch()}
          />
        ) : !matchesQuery.data?.length ? (
          <EmptyState
            title="No matches yet"
            description="Try updating location, price, or beds on your listing, or check again when more opposite listings are active."
          />
        ) : (
          <ul className="grid gap-3 sm:grid-cols-2">
            {matchesQuery.data.map((match) => (
              <li key={match.listing.listingRowId} className="h-full">
                <PropertyMatchCard match={match} />
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
