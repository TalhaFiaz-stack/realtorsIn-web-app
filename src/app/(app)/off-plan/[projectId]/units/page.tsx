import { OffPlanUnitsScreen } from "@/components/listings/off-plan-units-screen";
import { parseOffPlanRouteId } from "@/features/off-plan/lib/parse-off-plan-route-id";
import { notFound } from "next/navigation";

export const metadata = { title: "Available units" };

export default async function OffPlanUnitsPage({
  params,
}: {
  params: Promise<{ projectId: string }>;
}) {
  const { projectId: raw } = await params;
  const projectId = parseOffPlanRouteId(raw);
  if (!projectId) notFound();
  return <OffPlanUnitsScreen projectId={projectId} />;
}
