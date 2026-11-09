import { shareTextExternally } from "@/lib/share/share-external";
import { showAppToast } from "@/lib/toast/app-toast";

export function publishedListingShareUrl(propertyId: number, type: string) {
  const tab = type.toLowerCase().includes("rent") ? "rental" : "secondary";
  const params = new URLSearchParams({
    tab,
    property: String(propertyId),
    type,
  });
  if (typeof window === "undefined") {
    return `/listings?${params.toString()}`;
  }
  return `${window.location.origin}/listings?${params.toString()}`;
}

export async function sharePublishedListing(propertyId: number, type: string, title: string) {
  const url = publishedListingShareUrl(propertyId, type);
  const headline = title.trim() || "Property listing";
  const outcome = await shareTextExternally({
    title: headline,
    message: `Check out this listing on Realtor's In: ${headline}`,
    url,
  });
  if (outcome === "cancelled") return;
  if (outcome === "shared") {
    showAppToast.success("Shared", "Listing link sent from your device share menu.");
    return;
  }
  if (outcome === "copied") {
    showAppToast.success("Link copied", "Paste it anywhere to share this listing.");
    return;
  }
  if (outcome === "whatsapp") {
    showAppToast.success("WhatsApp opened", "We prefilled a message with the listing link.");
  }
}
