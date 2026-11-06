"use client";

import type { ReactNode } from "react";
import { Search } from "lucide-react";
import type { InquiryDraft } from "@/features/feed/hooks/use-create-post";
import { cn } from "@/lib/utils";

const PURPOSE_OPTIONS = [
  { label: "For Buy", value: "buy" },
  { label: "For Rent In", value: "rent_in" },
] as const;

const PROPERTY_TYPE_OPTIONS = [
  "Apartment",
  "Villa",
  "Townhouse",
  "Penthouse",
  "Studio",
  "Office",
  "Shop",
  "Warehouse",
  "Land",
] as const;

const BED_OPTIONS = [
  { label: "Studio", value: "0" },
  ...Array.from({ length: 10 }, (_, i) => {
    const n = i + 1;
    return {
      label: n === 1 ? "1 Bed" : `${n} Beds`,
      value: String(n),
    };
  }),
];

const FURNISHING_OPTIONS = [
  { label: "Unfurnished", value: "0" },
  { label: "Furnished", value: "1" },
  { label: "Semi-Furnished", value: "2" },
] as const;

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

export function CreatePostInquiryFields({
  value,
  onChange,
  disabled,
}: {
  value: InquiryDraft;
  onChange: (next: InquiryDraft) => void;
  disabled?: boolean;
}) {
  function patch(partial: Partial<InquiryDraft>) {
    onChange({ ...value, ...partial });
  }

  return (
    <div className="space-y-3 rounded-xl border border-border bg-muted/20 p-3">
      <div className="flex items-start gap-3 rounded-lg bg-[#F3E8FF] px-3 py-2.5">
        <span className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#7F3DE9] text-white">
          <Search className="h-4 w-4" aria-hidden />
        </span>
        <div>
          <p className="text-sm font-semibold text-foreground">
            Post Client Inquiry
          </p>
          <p className="text-xs text-muted-foreground">
            Broadcast a buyer/tenant need
          </p>
        </div>
      </div>

      <div>
        <FieldLabel required>Inquiry Label</FieldLabel>
        <input
          className={fieldClassName()}
          placeholder="Client's first name or ref..."
          value={value.clientLabel}
          disabled={disabled}
          onChange={(e) => patch({ clientLabel: e.target.value })}
        />
      </div>

      <div>
        <FieldLabel required>Budget Range (AED)</FieldLabel>
        <div className="grid grid-cols-2 gap-2">
          <input
            className={fieldClassName()}
            inputMode="numeric"
            placeholder="Min"
            value={value.budgetMin}
            disabled={disabled}
            onChange={(e) => patch({ budgetMin: e.target.value })}
          />
          <input
            className={fieldClassName()}
            inputMode="numeric"
            placeholder="Max"
            value={value.budgetMax}
            disabled={disabled}
            onChange={(e) => patch({ budgetMax: e.target.value })}
          />
        </div>
      </div>

      <div>
        <FieldLabel>Unit Size Range (sqft)</FieldLabel>
        <div className="grid grid-cols-2 gap-2">
          <input
            className={fieldClassName()}
            inputMode="numeric"
            placeholder="Min"
            value={value.areaMin}
            disabled={disabled}
            onChange={(e) => patch({ areaMin: e.target.value })}
          />
          <input
            className={fieldClassName()}
            inputMode="numeric"
            placeholder="Max"
            value={value.areaMax}
            disabled={disabled}
            onChange={(e) => patch({ areaMax: e.target.value })}
          />
        </div>
      </div>

      <div>
        <FieldLabel required>Property & Transaction</FieldLabel>
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
            value={value.purpose}
            disabled={disabled}
            onChange={(e) => patch({ purpose: e.target.value })}
          >
            <option value="">Purpose</option>
            {PURPOSE_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div>
        <FieldLabel required>Preferred Location</FieldLabel>
        <input
          className={fieldClassName()}
          placeholder="Community or building..."
          value={value.location}
          disabled={disabled}
          onChange={(e) => patch({ location: e.target.value })}
        />
      </div>

      <div className="grid grid-cols-2 gap-2">
        <div>
          <FieldLabel>Beds</FieldLabel>
          <select
            className={fieldClassName()}
            value={value.bedrooms}
            disabled={disabled}
            onChange={(e) => patch({ bedrooms: e.target.value })}
          >
            <option value="">Any</option>
            {BED_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
        <div>
          <FieldLabel>Furnishing</FieldLabel>
          <select
            className={fieldClassName()}
            value={value.furnishing}
            disabled={disabled}
            onChange={(e) => patch({ furnishing: e.target.value })}
          >
            <option value="">Any</option>
            {FURNISHING_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div>
        <FieldLabel>Public Notes</FieldLabel>
        <textarea
          className={cn(fieldClassName(), "h-20 resize-none py-2")}
          placeholder="Optional details for your network..."
          value={value.notes}
          disabled={disabled}
          onChange={(e) => patch({ notes: e.target.value })}
        />
      </div>
    </div>
  );
}
