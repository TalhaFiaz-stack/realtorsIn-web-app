import { OffPlanUnitDetailScreen } from "@/components/listings/off-plan-unit-detail-screen";

type Props = {
  params: Promise<{ projectId: string; unitId: string }>;
};

export default async function OffPlanUnitDetailPage({ params }: Props) {
  const { projectId, unitId } = await params;
  return <OffPlanUnitDetailScreen projectId={projectId} unitId={unitId} />;
}
