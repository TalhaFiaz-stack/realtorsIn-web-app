import { PublishedPropertyDetailScreen } from "@/components/listings/published-property-detail-screen";

export const metadata = { title: "Property" };

export default async function PublishedPropertyPage({
  params,
  searchParams,
}: {
  params: Promise<{ propertyId: string }>;
  searchParams: Promise<{ type?: string; contact?: string }>;
}) {
  const { propertyId: raw } = await params;
  const { type, contact } = await searchParams;
  const propertyId = Number(raw);
  return (
    <PublishedPropertyDetailScreen
      propertyId={propertyId}
      type={type?.trim() || "sale"}
      openContactOnLoad={contact === "1" || contact === "true"}
    />
  );
}
