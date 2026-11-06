"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { MoreHorizontal, Pencil, Search, Trash2 } from "lucide-react";
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
}: {
  listing: PropertyListing;
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
  const hasMenuActionsAboveDelete = canEdit || showFindMatches;

  return (
    <section className="rounded-xl border border-border bg-card p-4 shadow-sm">
      <div className="mb-3 flex items-start justify-between gap-2">
        <h2 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          Manage listing
        </h2>
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="-me-1 -mt-0.5 h-8 w-8 shrink-0 rounded-full text-muted-foreground data-[state=open]:bg-muted"
                aria-label="Listing options"
              >
                <MoreHorizontal className="h-5 w-5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              {canEdit ? (
                <DropdownMenuItem onClick={() => setEditOpen(true)}>
                  <Pencil className="mr-2 h-4 w-4" />
                  Edit
                </DropdownMenuItem>
              ) : null}
              {showFindMatches ? (
                <DropdownMenuItem asChild>
                  <Link href={propertyMatchesHref(listing.listingRowId, listing)}>
                    <Search className="mr-2 h-4 w-4" />
                    Find matches
                  </Link>
                </DropdownMenuItem>
              ) : null}
              {hasMenuActionsAboveDelete ? <DropdownMenuSeparator /> : null}
              <DropdownMenuItem
                className="text-destructive focus:text-destructive"
                onSelect={(event) => {
                  event.preventDefault();
                  setDeleteOpen(true);
                }}
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
      </div>

      <div className="flex flex-wrap gap-2">
        {canEdit ? (
          <Button
            type="button"
            variant="outline"
            className="h-9 flex-1 sm:flex-none"
            onClick={() => setEditOpen(true)}
          >
            Edit
          </Button>
        ) : null}
        {showFindMatches ? (
          <Button variant="default" className="h-9 flex-1 sm:flex-none" asChild>
            <Link href={propertyMatchesHref(listing.listingRowId, listing)}>
              Find matches
            </Link>
          </Button>
        ) : null}
        <Button
          type="button"
          variant="outline"
          className="h-9 flex-1 border-destructive/30 text-destructive hover:bg-destructive/5 hover:text-destructive sm:flex-none"
          disabled={deleteMutation.isPending}
          onClick={() => setDeleteOpen(true)}
        >
          Delete
        </Button>
      </div>

      <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this listing?</AlertDialogTitle>
            <AlertDialogDescription>
              This permanently removes the listing from your Property Hub.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
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
