"use client";

import dynamic from "next/dynamic";
import { Skeleton } from "@/components/ui/skeleton";
import type { OffPlanDetailLocationMapInnerProps } from "./off-plan-detail-location-map-inner";

const MapInner = dynamic<OffPlanDetailLocationMapInnerProps>(
  () =>
    import("./off-plan-detail-location-map-inner").then(
      (m) => m.OffPlanDetailLocationMapInner
    ),
  {
    ssr: false,
    loading: () => (
      <Skeleton
        className="h-56 w-full rounded-lg md:h-72"
        aria-busy
        aria-label="Loading map"
      />
    ),
  }
);

export function OffPlanDetailLocationMap(
  props: OffPlanDetailLocationMapInnerProps
) {
  return <MapInner {...props} />;
}
