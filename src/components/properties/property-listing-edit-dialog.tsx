"use client";

import { useEffect } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { ImagePlus, Loader2, X } from "lucide-react";
import { PropertyLocationSearch } from "@/components/properties/property-location-search";
import { RemoteImg } from "@/components/shared/remote-img";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  PROPERTY_BATH_OPTIONS,
  PROPERTY_BED_OPTIONS,
  PROPERTY_CATEGORY_OPTIONS,
  PROPERTY_FURNISHING_OPTIONS,
  PROPERTY_STATUS_OPTIONS,
  PROPERTY_TYPE_OPTIONS,
} from "@/features/feed/constants/create-post-property.constants";
import { propertiesErrorMessage } from "@/features/properties/hooks/use-property-hub";
import {
  buildListingEditForm,
  usePropertyListingEditForm,
} from "@/features/properties/hooks/use-property-listing-edit-form";
import { buildListingUpdateFormData } from "@/features/properties/lib/build-listing-update-form-data";
import { updateListingRequest } from "@/features/properties/services/properties-mutations.client";
import { validateEditListingForm } from "@/features/properties/validators/validate-edit-listing";
import type { PropertyListing } from "@/features/properties/types/property-hub.types";
import { showAppToast } from "@/lib/toast/app-toast";
import { cn } from "@/lib/utils";

function FieldLabel({
  children,
  required,
}: {
  children: React.ReactNode;
  required?: boolean;
}) {
  return (
    <label className="mb-1.5 block text-xs font-semibold text-foreground">
      {children}
      {required ? <span className="text-destructive"> *</span> : null}
    </label>
  );
}

function fieldClassName(className?: string) {
  return cn(
    "h-10 w-full rounded-lg border border-border bg-background px-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-primary/30",
    className
  );
}

export function PropertyListingEditDialog({
  listing,
  open,
  onOpenChange,
}: {
  listing: PropertyListing;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const queryClient = useQueryClient();
  const edit = usePropertyListingEditForm(listing);

  const { reset } = edit;
  useEffect(() => {
    if (open) reset();
  }, [open, listing.listingRowId, reset]);

  const mutation = useMutation({
    mutationFn: () => {
      const error = validateEditListingForm(edit.form, listing.type);
      if (error) {
        throw new Error(error);
      }
      const form = buildListingUpdateFormData(listing.listingRowId, edit.form);
      return updateListingRequest(
        {
          listingRowId: listing.listingRowId,
          type: listing.type,
          remPropertyId: listing.remPropertyId,
        },
        form
      );
    },
    onSuccess: (data) => {
      queryClient.setQueryData(
        [
          "properties",
          "detail",
          listing.listingRowId,
          listing.type,
          String(listing.remPropertyId ?? ""),
        ],
        { ok: true, listing: data.listing }
      );
      void queryClient.invalidateQueries({ queryKey: ["properties", "hub"] });
      showAppToast.success("Listing updated");
      onOpenChange(false);
    },
    onError: (error) => {
      showAppToast.error(propertiesErrorMessage(error));
    },
  });

  const { form, patch, isInquiry } = edit;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex max-h-[min(90vh,720px)] max-w-lg flex-col gap-0 p-0">
        <DialogHeader className="border-b border-border px-4 py-3">
          <DialogTitle className="text-base">
            {isInquiry ? "Update inquiry" : "Update property"}
          </DialogTitle>
        </DialogHeader>

        <div className="min-h-0 flex-1 overflow-y-auto px-4 py-3">
          <div className="space-y-3">
            {!isInquiry ? (
              <div>
                <FieldLabel required>Property photos</FieldLabel>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  disabled={
                    mutation.isPending ||
                    form.images.length >= edit.maxImages
                  }
                  onClick={edit.pickImages}
                >
                  <ImagePlus className="h-4 w-4" />
                  Add photos
                </Button>
                {form.images.length > 0 ? (
                  <ul className="mt-2 grid grid-cols-3 gap-2">
                    {form.images.map((item, index) => (
                      <li
                        key={`${item.url}-${index}`}
                        className="relative overflow-hidden rounded-lg border border-border"
                      >
                        <RemoteImg
                          src={item.url}
                          alt=""
                          wrapperClassName="aspect-square w-full"
                          className="aspect-square h-full w-full object-cover"
                        />
                        <button
                          type="button"
                          className="absolute right-1 top-1 rounded-full bg-black/70 p-1 text-white"
                          aria-label="Remove photo"
                          disabled={mutation.isPending}
                          onClick={() => edit.removeImage(index)}
                        >
                          <X className="h-3.5 w-3.5" />
                        </button>
                      </li>
                    ))}
                  </ul>
                ) : null}
              </div>
            ) : null}

            <div>
              <FieldLabel required>
                {isInquiry ? "Inquiry label" : "Title"}
              </FieldLabel>
              <input
                className={fieldClassName()}
                value={form.title}
                disabled={mutation.isPending}
                onChange={(e) => patch({ title: e.target.value })}
              />
            </div>

            {!isInquiry ? (
              <>
                <div>
                  <FieldLabel required>Category</FieldLabel>
                  <select
                    className={fieldClassName()}
                    value={form.category}
                    disabled={mutation.isPending}
                    onChange={(e) => patch({ category: e.target.value })}
                  >
                    <option value="">Category</option>
                    {PROPERTY_CATEGORY_OPTIONS.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <FieldLabel required>Property type</FieldLabel>
                    <select
                      className={fieldClassName()}
                      value={form.propertyType}
                      disabled={mutation.isPending}
                      onChange={(e) =>
                        patch({ propertyType: e.target.value })
                      }
                    >
                      <option value="">Type</option>
                      {PROPERTY_TYPE_OPTIONS.map((option) => (
                        <option key={option} value={option}>
                          {option}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <FieldLabel>Status</FieldLabel>
                    <select
                      className={fieldClassName()}
                      value={form.availability}
                      disabled={mutation.isPending}
                      onChange={(e) =>
                        patch({ availability: e.target.value })
                      }
                    >
                      {PROPERTY_STATUS_OPTIONS.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </>
            ) : (
              <div>
                <FieldLabel required>Property type</FieldLabel>
                <select
                  className={fieldClassName()}
                  value={form.propertyType}
                  disabled={mutation.isPending}
                  onChange={(e) => patch({ propertyType: e.target.value })}
                >
                  <option value="">Type</option>
                  {PROPERTY_TYPE_OPTIONS.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
              </div>
            )}

            <div>
              <FieldLabel required>Location</FieldLabel>
              <PropertyLocationSearch
                value={form.location}
                placeholder="Search for a location..."
                onChange={(sel) => edit.applyLocation(sel)}
              />
            </div>

            {!isInquiry ? (
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <FieldLabel required>Beds</FieldLabel>
                  <select
                    className={fieldClassName()}
                    value={form.bedrooms}
                    disabled={mutation.isPending}
                    onChange={(e) => patch({ bedrooms: e.target.value })}
                  >
                    <option value="">Beds</option>
                    {PROPERTY_BED_OPTIONS.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <FieldLabel required>Baths</FieldLabel>
                  <select
                    className={fieldClassName()}
                    value={form.baths}
                    disabled={mutation.isPending}
                    onChange={(e) => patch({ baths: e.target.value })}
                  >
                    <option value="">Baths</option>
                    {PROPERTY_BATH_OPTIONS.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            ) : null}

            <div>
              <FieldLabel required>
                {isInquiry ? "Budget range (AED)" : "Price & size"}
              </FieldLabel>
              <div className="grid grid-cols-2 gap-2">
                <input
                  className={fieldClassName()}
                  inputMode="numeric"
                  placeholder={isInquiry ? "Min budget" : "Price"}
                  value={form.priceStart}
                  disabled={mutation.isPending}
                  onChange={(e) => patch({ priceStart: e.target.value })}
                />
                <input
                  className={fieldClassName()}
                  inputMode="numeric"
                  placeholder={isInquiry ? "Max budget" : "Size (sqft)"}
                  value={isInquiry ? form.priceEnd : form.areaStart}
                  disabled={mutation.isPending}
                  onChange={(e) =>
                    isInquiry
                      ? patch({ priceEnd: e.target.value })
                      : patch({ areaStart: e.target.value })
                  }
                />
              </div>
            </div>

            {!isInquiry ? (
              <div>
                <FieldLabel>Furnishing</FieldLabel>
                <select
                  className={fieldClassName()}
                  value={form.wellFurnished}
                  disabled={mutation.isPending}
                  onChange={(e) => patch({ wellFurnished: e.target.value })}
                >
                  <option value="">Furnishing</option>
                  {PROPERTY_FURNISHING_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
            ) : null}

            <div>
              <FieldLabel>Notes</FieldLabel>
              <textarea
                className={cn(fieldClassName(), "min-h-[72px] py-2")}
                value={form.publicNotes}
                disabled={mutation.isPending}
                onChange={(e) => patch({ publicNotes: e.target.value })}
              />
            </div>
          </div>
        </div>

        <DialogFooter className="border-t border-border px-4 py-3">
          <Button
            type="button"
            variant="outline"
            disabled={mutation.isPending}
            onClick={() => onOpenChange(false)}
          >
            Cancel
          </Button>
          <Button
            type="button"
            disabled={mutation.isPending}
            onClick={() => mutation.mutate()}
          >
            {mutation.isPending ? (
              <Loader2 className="me-2 h-4 w-4 animate-spin" />
            ) : null}
            Save changes
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
