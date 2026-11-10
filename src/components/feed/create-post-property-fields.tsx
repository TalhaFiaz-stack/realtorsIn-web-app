"use client";

import type { ReactNode } from "react";
import { Home, ImagePlus, X } from "lucide-react";
import { RemoteImg } from "@/components/shared/remote-img";
import { Button } from "@/components/ui/button";
import {
  PROPERTY_BATH_OPTIONS,
  PROPERTY_BED_OPTIONS,
  PROPERTY_CATEGORY_OPTIONS,
  PROPERTY_FURNISHING_OPTIONS,
  PROPERTY_PURPOSE_OPTIONS,
  PROPERTY_STATUS_OPTIONS,
  PROPERTY_TYPE_OPTIONS,
} from "@/features/feed/constants/create-post-property.constants";
import type {
  CreatePreviewFile,
  PropertyDraft,
} from "@/features/feed/hooks/use-create-post";
import { PropertyLocationSearch } from "@/components/properties/property-location-search";
import { cn } from "@/lib/utils";

function FieldLabel({
  children,
  required,
}: {
  children: ReactNode;
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

export function CreatePostPropertyFields({
  value,
  onChange,
  images,
  maxImages,
  onPickImages,
  onRemoveImage,
  disabled,
}: {
  value: PropertyDraft;
  onChange: (next: PropertyDraft) => void;
  images: CreatePreviewFile[];
  maxImages: number;
  onPickImages: () => void;
  onRemoveImage: (index: number) => void;
  disabled?: boolean;
}) {
  function patch(partial: Partial<PropertyDraft>) {
    onChange({ ...value, ...partial });
  }

  return (
    <div className="space-y-3 rounded-xl border border-border bg-muted/20 p-3">
      <div className="flex items-start gap-3 rounded-lg bg-[#E8F8F0] px-3 py-2.5">
        <span className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#22A06B] text-white">
          <Home className="h-4 w-4" aria-hidden />
        </span>
        <div>
          <p className="text-sm font-semibold text-foreground">Share Property</p>
          <p className="text-xs text-muted-foreground">
            List a property for agents
          </p>
        </div>
      </div>

      <div>
        <FieldLabel required>Property Photos</FieldLabel>
        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={disabled || images.length >= maxImages}
          onClick={onPickImages}
        >
          <ImagePlus className="h-4 w-4" />
          Add photos
        </Button>
        <p className="mt-1 text-[11px] text-muted-foreground">
          JPG, PNG · up to {maxImages} images
        </p>
        {images.length > 0 ? (
          <ul className="mt-2 grid grid-cols-2 gap-2 sm:grid-cols-3">
            {images.map((item, index) => (
              <li
                key={item.url}
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
                  disabled={disabled}
                  onClick={() => onRemoveImage(index)}
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </li>
            ))}
          </ul>
        ) : null}
      </div>

      <div>
        <FieldLabel required>Title</FieldLabel>
        <input
          className={fieldClassName()}
          placeholder="Enter a title for your property"
          value={value.title}
          disabled={disabled}
          onChange={(e) => patch({ title: e.target.value })}
        />
      </div>

      <div>
        <FieldLabel>Listing Tags</FieldLabel>
        <div className="flex flex-wrap gap-2">
          {(
            [
              { value: "exclusive", label: "Exclusive" },
              { value: "distressed", label: "Distressed" },
            ] as const
          ).map((tag) => {
            const selected = value.listingTag === tag.value;
            return (
              <button
                key={tag.value}
                type="button"
                disabled={disabled}
                onClick={() =>
                  patch({
                    listingTag: selected ? "" : tag.value,
                  })
                }
                className={cn(
                  "rounded-full border px-3 py-1.5 text-xs font-semibold transition-colors",
                  selected
                    ? "border-[#22A06B] bg-[#22A06B] text-white"
                    : "border-border bg-card text-foreground hover:bg-muted"
                )}
              >
                {tag.value === "exclusive" ? "⭐ " : "🔥 "}
                {tag.label}
              </button>
            );
          })}
        </div>
      </div>

      <div>
        <FieldLabel required>Category</FieldLabel>
        <select
          className={fieldClassName()}
          value={value.category}
          disabled={disabled}
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

      <div>
        <FieldLabel required>Property Type & Status</FieldLabel>
        <div className="grid grid-cols-2 gap-2">
          <select
            className={fieldClassName()}
            value={value.propertyType}
            disabled={disabled}
            onChange={(e) => patch({ propertyType: e.target.value })}
          >
            <option value="">Type</option>
            {PROPERTY_TYPE_OPTIONS.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
          <select
            className={fieldClassName()}
            value={value.status}
            disabled={disabled}
            onChange={(e) => patch({ status: e.target.value })}
          >
            {PROPERTY_STATUS_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div>
        <FieldLabel required>Location</FieldLabel>
        <PropertyLocationSearch
          value={value.location}
          placeholder="Search for a location..."
          disabled={disabled}
          onChange={(sel) =>
            patch(
              sel
                ? {
                    location: sel.label,
                    latLong: sel.latLong,
                    city: sel.city,
                    community: sel.community,
                    subCommunity: sel.subCommunity,
                  }
                : { location: "", latLong: "", city: "", community: "", subCommunity: "" }
            )
          }
        />
      </div>

      <div>
        <FieldLabel required>Transaction & Furnishing</FieldLabel>
        <div className="grid grid-cols-2 gap-2">
          <select
            className={fieldClassName()}
            value={value.purpose}
            disabled={disabled}
            onChange={(e) => patch({ purpose: e.target.value })}
          >
            <option value="">Purpose</option>
            {PROPERTY_PURPOSE_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          <select
            className={fieldClassName()}
            value={value.furnishing}
            disabled={disabled}
            onChange={(e) => patch({ furnishing: e.target.value })}
          >
            <option value="">Furnishing</option>
            {PROPERTY_FURNISHING_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div>
        <FieldLabel required>Bedrooms & Bathrooms</FieldLabel>
        <div className="grid grid-cols-2 gap-2">
          <select
            className={fieldClassName()}
            value={value.bedrooms}
            disabled={disabled}
            onChange={(e) => patch({ bedrooms: e.target.value })}
          >
            <option value="">Beds</option>
            {PROPERTY_BED_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          <select
            className={fieldClassName()}
            value={value.baths}
            disabled={disabled}
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

      <div>
        <FieldLabel required>Price & Unit Size</FieldLabel>
        <div className="grid grid-cols-2 gap-2">
          <input
            className={fieldClassName()}
            inputMode="numeric"
            placeholder="Price (AED)"
            value={value.price}
            disabled={disabled}
            onChange={(e) => patch({ price: e.target.value })}
          />
          <input
            className={fieldClassName()}
            inputMode="numeric"
            placeholder="Size (sqft)"
            value={value.unitSize}
            disabled={disabled}
            onChange={(e) => patch({ unitSize: e.target.value })}
          />
        </div>
      </div>
    </div>
  );
}
