"use client";

import { PublishedPropertyDetailPanel } from "@/components/listings/published-property-detail-panel";

/** Full-page route (`/listings/property/[id]`); browse uses `PublishedPropertyDetailPanel` in a modal. */
export function PublishedPropertyDetailScreen({
  propertyId,
  type,
  openContactOnLoad = false,
}: {
  propertyId: number;
  type: string;
  openContactOnLoad?: boolean;
}) {
  return (
    <PublishedPropertyDetailPanel
      propertyId={propertyId}
      type={type}
      openContactOnLoad={openContactOnLoad}
      variant="page"
    />
  );
}
