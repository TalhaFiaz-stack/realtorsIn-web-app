import { PropertyListingDetailScreen } from "@/components/properties/property-listing-detail-screen";

export const metadata = { title: "Listing" };

export default async function PropertyListingPage({
  params,
}: {
  params: Promise<{ listingRowId: string }>;
}) {
  const { listingRowId: raw } = await params;
  const listingRowId = Number(raw);
  return <PropertyListingDetailScreen listingRowId={listingRowId} />;
}
