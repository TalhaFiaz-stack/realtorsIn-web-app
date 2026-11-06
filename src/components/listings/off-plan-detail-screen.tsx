"use client";

import { OffPlanDetailPage } from "@/components/listings/off-plan-detail/off-plan-detail-page";

export function OffPlanDetailScreen({ projectId }: { projectId: string }) {
  return <OffPlanDetailPage projectId={projectId} />;
}
