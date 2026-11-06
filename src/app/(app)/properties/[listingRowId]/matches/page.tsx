import { PropertyMatchesScreen } from "@/components/properties/property-matches-screen";

export const metadata = { title: "Find matches" };

export default async function PropertyMatchesPage({
  params,
}: {
  params: Promise<{ listingRowId: string }>;
}) {
  const { listingRowId: raw } = await params;
  const listingRowId = Number(raw);
  return <PropertyMatchesScreen listingRowId={listingRowId} />;
}
