import { OffPlanDetailScreen } from "@/components/listings/off-plan-detail-screen";
import { parseOffPlanRouteId } from "@/features/off-plan/lib/parse-off-plan-route-id";
import { notFound } from "next/navigation";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ projectId: string }>;
}) {
  const { projectId } = await params;
  return { title: `Project ${projectId}` };
}

export default async function OffPlanProjectPage({
  params,
}: {
  params: Promise<{ projectId: string }>;
}) {
  const { projectId: raw } = await params;
  const projectId = parseOffPlanRouteId(raw);
  if (!projectId) notFound();
  return <OffPlanDetailScreen projectId={projectId} />;
}
