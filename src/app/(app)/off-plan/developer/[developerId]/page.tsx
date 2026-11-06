import { OffPlanDeveloperPage } from "@/components/listings/off-plan-developer/off-plan-developer-page";
import { notFound } from "next/navigation";

function parseDeveloperId(raw: string): number | null {
  const n = Number(raw);
  if (!Number.isFinite(n) || n <= 0) return null;
  return n;
}

function qp(
  searchParams: Record<string, string | string[] | undefined>,
  key: string
): string | null {
  const v = searchParams[key];
  if (typeof v === "string" && v.length > 0) return v;
  return null;
}

export async function generateMetadata({
  params,
  searchParams,
}: {
  params: Promise<{ developerId: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const { developerId: raw } = await params;
  const sp = await searchParams;
  const name = qp(sp, "name");
  const id = parseDeveloperId(raw);
  if (!id) return { title: "Developer" };
  return { title: name ?? `Developer ${id}` };
}

export default async function OffPlanDeveloperRoutePage({
  params,
  searchParams,
}: {
  params: Promise<{ developerId: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const { developerId: raw } = await params;
  const developerId = parseDeveloperId(raw);
  if (!developerId) notFound();

  const sp = await searchParams;

  return (
    <OffPlanDeveloperPage
      developerId={developerId}
      name={qp(sp, "name")}
      image={qp(sp, "image")}
      description={qp(sp, "description")}
      email={qp(sp, "email")}
      website={qp(sp, "website")}
      address={qp(sp, "address")}
      workingTime={qp(sp, "workingTime")}
      typeLabel={qp(sp, "type")}
    />
  );
}
