"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Check, SlidersHorizontal } from "lucide-react";
import { FormSection, ProfileFormDialog } from "@/components/profile/profile-form-dialog";
import {
  DEFAULT_FEED_CONTENT_FILTERS,
  type FeedContentFilters,
} from "@/features/feed/types/search.types";
import { cn } from "@/lib/utils";

const FEED_TYPE_OPTS = [
  { id: "all", label: "All" },
  { id: "off_plan", label: "Off-Plan" },
  { id: "properties", label: "Properties" },
  { id: "inquiries", label: "Inquiries" },
  { id: "video", label: "Video" },
] as const;

const PROPERTY_TYPE_OPTS = [
  { id: "all", label: "All types" },
  { id: "apartment", label: "Apartment" },
  { id: "villa", label: "Villa" },
  { id: "townhouse", label: "Townhouse" },
  { id: "penthouse", label: "Penthouse" },
] as const;

const TRANSACTION_OPTS = [
  { id: "all", label: "All" },
  { id: "sale", label: "For sale" },
  { id: "rent", label: "For rent" },
] as const;

const INQUIRY_OPTS = [
  { id: "all", label: "All" },
  { id: "buy", label: "Buy inquiries" },
  { id: "rent", label: "Rent inquiries" },
] as const;

function PillRow<T extends string>({
  options,
  value,
  onChange,
  label,
}: {
  options: readonly { id: T; label: string }[];
  value: T;
  onChange: (id: T) => void;
  label: string;
}) {
  return (
    <div role="radiogroup" aria-label={label} className="flex flex-wrap gap-1.5">
      {options.map((opt) => {
        const selected = value === opt.id;
        return (
          <button
            key={opt.id}
            type="button"
            role="radio"
            aria-checked={selected}
            onClick={() => onChange(opt.id)}
            className={cn(
              "inline-flex h-8 items-center gap-1 rounded-full border px-3.5 text-[13px] font-medium transition-colors",
              selected
                ? "border-primary bg-primary/10 text-primary"
                : "border-border text-foreground/80 hover:bg-muted"
            )}
          >
            {selected ? <Check className="h-3.5 w-3.5" aria-hidden /> : null}
            {opt.label}
          </button>
        );
      })}
    </div>
  );
}

/** Which secondary filters apply to a content type. */
function sectionsFor(feedType: FeedContentFilters["feedType"]) {
  return {
    property: feedType === "all" || feedType === "properties" || feedType === "off_plan",
    transaction: feedType === "all" || feedType === "properties",
    inquiry: feedType === "all" || feedType === "inquiries",
  };
}

/** Drop values for sections hidden by the chosen content type. */
export function normalizeFeedFilters(filters: FeedContentFilters): FeedContentFilters {
  const show = sectionsFor(filters.feedType);
  return {
    feedType: filters.feedType,
    propertyCategory: show.property ? filters.propertyCategory : "all",
    transaction: show.transaction ? filters.transaction : "all",
    inquiryType: show.inquiry ? filters.inquiryType : "all",
  };
}

export const FEED_FILTER_LABELS = {
  feedType: Object.fromEntries(FEED_TYPE_OPTS.map((o) => [o.id, o.label])),
  propertyCategory: Object.fromEntries(PROPERTY_TYPE_OPTS.map((o) => [o.id, o.label])),
  transaction: Object.fromEntries(TRANSACTION_OPTS.map((o) => [o.id, o.label])),
  inquiryType: Object.fromEntries(INQUIRY_OPTS.map((o) => [o.id, o.label])),
} as const;

export function feedFiltersHref(filters: FeedContentFilters): string {
  const f = normalizeFeedFilters(filters);
  const params = new URLSearchParams();
  if (f.feedType !== "all") params.set("feedType", f.feedType);
  if (f.propertyCategory !== "all") params.set("propertyCategory", f.propertyCategory);
  if (f.transaction !== "all") params.set("transaction", f.transaction);
  if (f.inquiryType !== "all") params.set("inquiryType", f.inquiryType);
  const qs = params.toString();
  return qs ? `/feed?${qs}` : "/feed";
}

export function parseFiltersFromSearch(search: string): FeedContentFilters {
  const params = new URLSearchParams(search);
  const feedType = params.get("feedType");
  const propertyCategory = params.get("propertyCategory");
  const transaction = params.get("transaction");
  const inquiryType = params.get("inquiryType");
  return {
    feedType:
      FEED_TYPE_OPTS.some((o) => o.id === feedType) && feedType
        ? (feedType as FeedContentFilters["feedType"])
        : "all",
    propertyCategory:
      PROPERTY_TYPE_OPTS.some((o) => o.id === propertyCategory) &&
      propertyCategory
        ? (propertyCategory as FeedContentFilters["propertyCategory"])
        : "all",
    transaction:
      TRANSACTION_OPTS.some((o) => o.id === transaction) && transaction
        ? (transaction as FeedContentFilters["transaction"])
        : "all",
    inquiryType:
      INQUIRY_OPTS.some((o) => o.id === inquiryType) && inquiryType
        ? (inquiryType as FeedContentFilters["inquiryType"])
        : "all",
  };
}

export function countActiveFeedFilters(filters: FeedContentFilters): number {
  let n = 0;
  if (filters.feedType !== "all") n += 1;
  if (filters.propertyCategory !== "all") n += 1;
  if (filters.transaction !== "all") n += 1;
  if (filters.inquiryType !== "all") n += 1;
  return n;
}

export function FeedFilterDialog({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const router = useRouter();
  const initial = useMemo(
    () =>
      typeof window !== "undefined"
        ? parseFiltersFromSearch(window.location.search)
        : DEFAULT_FEED_CONTENT_FILTERS,
    [open]
  );
  const [draft, setDraft] = useState<FeedContentFilters>(initial);

  useEffect(() => {
    if (open) setDraft(initial);
  }, [open, initial]);

  function apply() {
    onOpenChange(false);
    router.push(feedFiltersHref(draft));
  }

  const show = sectionsFor(draft.feedType);
  const activeCount = countActiveFeedFilters(normalizeFeedFilters(draft));

  return (
    <ProfileFormDialog
      open={open}
      onOpenChange={onOpenChange}
      icon={SlidersHorizontal}
      title="Filter feed"
      description="Show only the posts you care about."
      size="sm"
      saveLabel="Show results"
      onSave={apply}
      footerStart={
        <button
          type="button"
          disabled={activeCount === 0}
          onClick={() => setDraft(DEFAULT_FEED_CONTENT_FILTERS)}
          className="text-sm font-semibold text-primary hover:underline disabled:text-muted-foreground disabled:no-underline"
        >
          Reset{activeCount ? ` (${activeCount})` : ""}
        </button>
      }
    >
      <FormSection title="Content type">
        <PillRow
          label="Content type"
          options={FEED_TYPE_OPTS}
          value={draft.feedType}
          onChange={(feedType) => setDraft((d) => ({ ...d, feedType }))}
        />
      </FormSection>

      {show.property ? (
        <FormSection title="Property type">
          <PillRow
            label="Property type"
            options={PROPERTY_TYPE_OPTS}
            value={draft.propertyCategory}
            onChange={(propertyCategory) => setDraft((d) => ({ ...d, propertyCategory }))}
          />
        </FormSection>
      ) : null}

      {show.transaction ? (
        <FormSection title="Transaction">
          <PillRow
            label="Transaction"
            options={TRANSACTION_OPTS}
            value={draft.transaction}
            onChange={(transaction) => setDraft((d) => ({ ...d, transaction }))}
          />
        </FormSection>
      ) : null}

      {show.inquiry ? (
        <FormSection title="Inquiry type">
          <PillRow
            label="Inquiry type"
            options={INQUIRY_OPTS}
            value={draft.inquiryType}
            onChange={(inquiryType) => setDraft((d) => ({ ...d, inquiryType }))}
          />
        </FormSection>
      ) : null}
    </ProfileFormDialog>
  );
}
