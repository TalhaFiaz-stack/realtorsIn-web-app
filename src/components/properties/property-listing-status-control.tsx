"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { ChevronDown, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { SOCIAL_PROPERTY_STATUS_OPTIONS } from "@/features/properties/constants/property-hub.constants";
import { propertiesErrorMessage } from "@/features/properties/hooks/use-property-hub";
import {
  socialPropertyStatusLabel,
  socialPropertyStatusTone,
} from "@/features/properties/lib/property-listing-status";
import { updateListingStatusRequest } from "@/features/properties/services/properties-mutations.client";
import type { PropertyListing } from "@/features/properties/types/property-hub.types";
import { showAppToast } from "@/lib/toast/app-toast";
import { cn } from "@/lib/utils";

function listingDetailQueryKey(listing: PropertyListing, remQueryRaw?: string) {
  return [
    "properties",
    "detail",
    listing.listingRowId,
    listing.type,
    remQueryRaw ?? String(listing.remPropertyId ?? ""),
  ] as const;
}

export function PropertyListingStatusControl({
  listing,
  remQueryRaw,
  size = "sm",
  className,
}: {
  listing: PropertyListing;
  /** Must match detail page search param for cache updates. */
  remQueryRaw?: string;
  size?: "sm" | "md";
  className?: string;
}) {
  const queryClient = useQueryClient();
  const editable = listing.isEditable !== false;
  const label = socialPropertyStatusLabel(listing.propertyStatusId);
  const tone = socialPropertyStatusTone(listing.propertyStatusId);

  const mutation = useMutation({
    mutationFn: (propertyStatusId: number) =>
      updateListingStatusRequest(
        {
          listingRowId: listing.listingRowId,
          type: listing.type,
          remPropertyId: listing.remPropertyId,
        },
        propertyStatusId
      ),
    onSuccess: (data) => {
      const updated = data.listing;
      queryClient.setQueryData(
        listingDetailQueryKey(listing, remQueryRaw),
        { ok: true, listing: updated }
      );
      void queryClient.invalidateQueries({ queryKey: ["properties", "hub"] });
      showAppToast.success("Status updated");
    },
    onError: (error) => {
      showAppToast.error(propertiesErrorMessage(error));
    },
  });

  const pending = mutation.isPending;

  if (!editable) {
    return listing.propertyStatusLabel ? (
      <span
        className={cn(
          "rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide",
          tone === "active"
            ? "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400"
            : "bg-muted text-muted-foreground",
          className
        )}
      >
        {listing.propertyStatusLabel}
      </span>
    ) : null;
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          type="button"
          variant="outline"
          size={size === "md" ? "default" : "sm"}
          disabled={pending}
          className={cn(
            "h-auto shrink-0 gap-1 rounded-full border px-2.5 py-1 text-[11px] font-semibold shadow-none",
            tone === "active"
              ? "border-teal-500/35 bg-teal-500/10 text-teal-800 hover:bg-teal-500/15 dark:text-teal-300"
              : "border-border bg-muted/40 text-muted-foreground hover:bg-muted",
            size === "md" && "px-3 py-1.5 text-xs",
            className
          )}
          onClick={(e) => e.stopPropagation()}
          onPointerDown={(e) => e.stopPropagation()}
        >
          {pending ? (
            <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden />
          ) : null}
          <span>{label}</span>
          <ChevronDown className="h-3.5 w-3.5 opacity-70" aria-hidden />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        className="min-w-[10rem]"
        onClick={(e) => e.stopPropagation()}
      >
        {SOCIAL_PROPERTY_STATUS_OPTIONS.map((opt) => (
          <DropdownMenuItem
            key={opt.value}
            disabled={
              pending || listing.propertyStatusId === opt.value
            }
            onSelect={() => {
              if (listing.propertyStatusId === opt.value) return;
              mutation.mutate(opt.value);
            }}
          >
            {opt.label}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
