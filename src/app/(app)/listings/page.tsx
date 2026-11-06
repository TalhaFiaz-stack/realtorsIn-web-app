import { Suspense } from "react";
import { ListingsBrowseScreen } from "@/components/listings/listings-browse-screen";
import { OffPlanProjectGridSkeleton } from "@/components/listings/off-plan-skeletons";

export const metadata = { title: "Listings" };

export default function ListingsPage() {
  return (
    <Suspense
      fallback={
        <div className="w-full space-y-4 pb-10 pt-4">
          <div className="h-24 animate-pulse rounded-xl bg-muted" />
          <OffPlanProjectGridSkeleton count={6} />
        </div>
      }
    >
      <ListingsBrowseScreen />
    </Suspense>
  );
}
