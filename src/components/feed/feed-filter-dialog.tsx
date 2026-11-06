"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
  { id: "all", label: "All Types" },
  { id: "apartment", label: "Apartment" },
  { id: "villa", label: "Villa" },
  { id: "townhouse", label: "Townhouse" },
  { id: "penthouse", label: "Penthouse" },
] as const;

const TRANSACTION_OPTS = [
  { id: "all", label: "All" },
  { id: "sale", label: "For Sale" },
  { id: "rent", label: "For Rent" },
] as const;

const INQUIRY_OPTS = [
  { id: "all", label: "All" },
  { id: "buy", label: "Buy Inquiries" },
  { id: "rent", label: "Rent Inquiries" },
] as const;

function PillRow<T extends string>({
  options,
  value,
  onChange,
  accentClassName = "bg-primary text-primary-foreground",
}: {
  options: readonly { id: T; label: string }[];
  value: T;
  onChange: (id: T) => void;
  accentClassName?: string;
}) {
  return (
    <div className="flex flex-wrap gap-2">
      {options.map((opt) => {
        const selected = value === opt.id;
        return (
          <button
            key={opt.id}
            type="button"
            onClick={() => onChange(opt.id)}
            className={cn(
              "rounded-full px-3 py-1.5 text-xs font-semibold transition-colors",
              selected
                ? accentClassName
                : "bg-muted text-muted-foreground hover:bg-muted/80"
            )}
          >
            {opt.label}
          </button>
        );
      })}
    </div>
  );
}

function parseFiltersFromSearch(search: string): FeedContentFilters {
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
    const params = new URLSearchParams();
    if (draft.feedType !== "all") params.set("feedType", draft.feedType);
    if (draft.propertyCategory !== "all") {
      params.set("propertyCategory", draft.propertyCategory);
    }
    if (draft.transaction !== "all") {
      params.set("transaction", draft.transaction);
    }
    if (draft.inquiryType !== "all") {
      params.set("inquiryType", draft.inquiryType);
    }
    const qs = params.toString();
    onOpenChange(false);
    router.push(qs ? `/feed?${qs}` : "/feed");
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Filter Feed</DialogTitle>
          <DialogDescription>
            Narrow the home feed by content type — same options as the mobile
            app.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-5 py-1">
          <section className="space-y-2">
            <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
              Content type
            </p>
            <PillRow
              options={FEED_TYPE_OPTS}
              value={draft.feedType}
              onChange={(feedType) => setDraft((d) => ({ ...d, feedType }))}
            />
          </section>

          <section className="space-y-2">
            <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
              Property type
            </p>
            <PillRow
              options={PROPERTY_TYPE_OPTS}
              value={draft.propertyCategory}
              onChange={(propertyCategory) =>
                setDraft((d) => ({ ...d, propertyCategory }))
              }
            />
          </section>

          <section className="space-y-2">
            <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
              Transaction
            </p>
            <PillRow
              options={TRANSACTION_OPTS}
              value={draft.transaction}
              onChange={(transaction) =>
                setDraft((d) => ({ ...d, transaction }))
              }
              accentClassName="bg-emerald-600 text-white"
            />
          </section>

          <section className="space-y-2">
            <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
              Inquiry type
            </p>
            <PillRow
              options={INQUIRY_OPTS}
              value={draft.inquiryType}
              onChange={(inquiryType) =>
                setDraft((d) => ({ ...d, inquiryType }))
              }
              accentClassName="bg-violet-600 text-white"
            />
          </section>
        </div>

        <DialogFooter className="gap-2 sm:gap-2">
          <Button
            type="button"
            variant="ghost"
            onClick={() => {
              setDraft(DEFAULT_FEED_CONTENT_FILTERS);
            }}
          >
            Reset
          </Button>
          <Button type="button" onClick={apply}>
            Apply
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
