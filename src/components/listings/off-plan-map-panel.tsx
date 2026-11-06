"use client";

import dynamic from "next/dynamic";
import { useQuery } from "@tanstack/react-query";
import type { OffPlanDistrict, OffPlanProjectSummary } from "@/features/off-plan/types/off-plan.types";
import { fetchGoogleMapsKeyClient } from "@/features/maps/services/google-maps.client";
import { OffPlanMapPanelSkeleton } from "@/components/listings/off-plan-skeletons";
import { cn } from "@/lib/utils";

const OffPlanGoogleMapView = dynamic(
  () =>
    import("@/components/listings/off-plan-google-map-view").then(
      (m) => m.OffPlanGoogleMapView
    ),
  {
    ssr: false,
    loading: () => <OffPlanMapPanelSkeleton className="rounded-xl border border-border" />,
  }
);

const OffPlanMapView = dynamic(
  () =>
    import("@/components/listings/off-plan-map-view").then((m) => m.OffPlanMapView),
  {
    ssr: false,
    loading: () => <OffPlanMapPanelSkeleton className="rounded-xl border border-border" />,
  }
);

export function OffPlanMapPanel(props: {
  projects: OffPlanProjectSummary[];
  districts: OffPlanDistrict[];
  selectedDistrictId?: string;
  selectedProjectId: string | null;
  onSelectProject: (id: string | null) => void;
  selectedProject?: OffPlanProjectSummary | null;
  onOpenProject?: () => void;
  className?: string;
}) {
  const keyQuery = useQuery({
    queryKey: ["google-maps-key"],
    queryFn: ({ signal }) => fetchGoogleMapsKeyClient(signal),
    staleTime: 60 * 60 * 1000,
    retry: false,
  });

  const apiKey = keyQuery.data?.googleMapsKey;

  if (keyQuery.isLoading) {
    return <OffPlanMapPanelSkeleton className={props.className} />;
  }

  if (apiKey) {
    return <OffPlanGoogleMapView apiKey={apiKey} {...props} />;
  }

  return <OffPlanMapView {...props} />;
}
