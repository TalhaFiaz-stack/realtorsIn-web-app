"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { MoreHorizontal, Newspaper, Pencil, Sparkles, Trash2 } from "lucide-react";
import {
  detailPriceHeadline,
  isRequirementListing,
  listingPriceCaption,
} from "@/components/properties/property-listing-detail-view";
import { PropertyListingShare } from "@/components/properties/property-listing-share";
import { Avatar, AvatarImage, AvatarPlaceholderFallback } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import { PropertyListingEditDialog } from "@/components/properties/property-listing-edit-dialog";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { propertyMatchesHref } from "@/features/properties/lib/property-listing-routes";
import type { PropertyListing } from "@/features/properties/types/property-hub.types";
import { deleteListingRequest } from "@/features/properties/services/properties-mutations.client";
import { showAppToast } from "@/lib/toast/app-toast";
import { propertiesErrorMessage } from "@/features/properties/hooks/use-property-hub";

export function PropertyListingDetailActions({
  listing,
  statusControl,
}: {
  listing: PropertyListing;
  /** Status dropdown (owned by the screen so cache keys match the URL). */
  statusControl?: React.ReactNode;
}) {
  const router = useRouter();
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const queryClient = useQueryClient();

  const deleteMutation = useMutation({
    mutationFn: () =>
      deleteListingRequest({
        listingRowId: listing.listingRowId,
        type: listing.type,
        remPropertyId: listing.remPropertyId,
      }),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["properties", "hub"] });
      showAppToast.success("Listing deleted");
      router.push("/properties");
    },
    onError: (error) => {
      showAppToast.error(propertiesErrorMessage(error));
    },
  });

  const showFindMatches = Boolean(listing.title?.trim());
  const canEdit = listing.isEditable !== false;
  const requirement = isRequirementListing(listing.type);
  const price = detailPriceHeadline(listing);

  return (
    <section className="rounded-2xl border border-border bg-card p-5 shadow-sm">
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            {listingPriceCaption(listing.type)}
          </p>
          <p className="mt-0.5 text-2xl font-bold tabular-nums tracking-tight text-foreground" dir="ltr">
            {price.headline}
          </p>
          {price.exact ? (
            <p className="mt-0.5 text-xs tabular-nums text-muted-foreground" dir="ltr">
              {price.exact}
            </p>
          ) : null}
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="-me-2 -mt-1 h-9 w-9 shrink-0 rounded-full text-muted-foreground data-[state=open]:bg-muted"
              aria-label="Listing options"
            >
              <MoreHorizontal className="h-5 w-5" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-52">
            {canEdit ? (
              <DropdownMenuItem onClick={() => setEditOpen(true)}>
                <Pencil className="mr-2 h-4 w-4" />
                Edit listing
              </DropdownMenuItem>
            ) : null}
            {listing.postId ? (
              <DropdownMenuItem asChild>
                <Link href={`/posts/${listing.postId}`}>
                  <Newspaper className="mr-2 h-4 w-4" />
                  View feed post
                </Link>
              </DropdownMenuItem>
            ) : null}
            <DropdownMenuSeparator />
            <DropdownMenuItem
              className="text-destructive focus:text-destructive"
              onSelect={(event) => {
                event.preventDefault();
                setDeleteOpen(true);
              }}
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Delete listing
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <div className="mt-4 flex items-center justify-between gap-3 rounded-xl bg-muted/50 px-3.5 py-2.5">
        <span className="text-sm font-medium text-muted-foreground">Status</span>
        {statusControl}
      </div>

      <div className="mt-4 space-y-2">
        {showFindMatches ? (
          <Button className="h-11 w-full rounded-full text-[15px] font-semibold" asChild>
            <Link href={propertyMatchesHref(listing.listingRowId, listing)}>
              <Sparkles className="h-4 w-4" aria-hidden />
              {requirement ? "Find matching properties" : "Find matching clients"}
            </Link>
          </Button>
        ) : null}
        <div className="grid grid-cols-2 gap-2">
          {canEdit ? (
            <Button
              type="button"
              variant="outline"
              className="h-10 rounded-full"
              onClick={() => setEditOpen(true)}
            >
              <Pencil className="h-4 w-4" aria-hidden />
              Edit
            </Button>
          ) : null}
          <PropertyListingShare
            listing={listing}
            className={cn("h-10 rounded-full", !canEdit && "col-span-2")}
          />
        </div>
      </div>

      {listing.agentName ? (
        <div className="mt-5 flex items-center gap-3 border-t border-border/70 pt-4">
          <Avatar className="h-10 w-10">
            {listing.agentImageUrl ? <AvatarImage src={listing.agentImageUrl} alt="" /> : null}
            <AvatarPlaceholderFallback />
          </Avatar>
          <div className="min-w-0">
            <p className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">Listing agent</p>
            <p className="truncate text-sm font-semibold text-foreground">{listing.agentName}</p>
          </div>
        </div>
      ) : null}

      <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this listing?</AlertDialogTitle>
            <AlertDialogDescription>
              “{listing.title ?? "This listing"}” will be permanently removed from your
              Property Hub. This can’t be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              disabled={deleteMutation.isPending}
              onClick={() => deleteMutation.mutate()}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete listing
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <PropertyListingEditDialog
        listing={listing}
        open={editOpen}
        onOpenChange={setEditOpen}
      />
    </section>
  );
}
