"use client";

import { useMemo, useState } from "react";
import { Share2 } from "lucide-react";
import { ContentShareDialog } from "@/components/chat/content-share-dialog";
import { Button } from "@/components/ui/button";
import { buildGenericShareMessage } from "@/features/chat/lib/content-share";
import { propertyListingHref } from "@/features/properties/lib/property-listing-routes";
import type { PropertyListing } from "@/features/properties/types/property-hub.types";

export function PropertyListingShare({
  listing,
  className,
}: {
  listing: PropertyListing;
  className?: string;
}) {
  const [open, setOpen] = useState(false);
  const listingPath = useMemo(
    () => propertyListingHref(listing.listingRowId, listing),
    [listing]
  );
  const publicUrl = useMemo(() => {
    if (typeof window === "undefined") return listingPath;
    return `${window.location.origin}${listingPath}`;
  }, [listingPath]);

  const title = listing.title?.trim() || "Property listing";
  const externalMessage = buildGenericShareMessage(title, publicUrl);
  const chatEntity = listing.postId
    ? ({ type: "post" as const, postId: listing.postId })
    : null;

  return (
    <>
      <Button
        type="button"
        variant="outline"
        size="sm"
        className={className ?? "w-full sm:w-auto"}
        onClick={() => setOpen(true)}
      >
        <Share2 className="h-4 w-4" aria-hidden />
        Share
      </Button>
      <ContentShareDialog
        open={open}
        onOpenChange={setOpen}
        dialogTitle="Share Property"
        publicUrl={publicUrl}
        externalTitle={title}
        externalMessage={externalMessage}
        chatEntity={chatEntity}
        allowMessageShare={Boolean(listing.postId)}
      />
    </>
  );
}
