"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { SlidersHorizontal, X } from "lucide-react";
import {
  FEED_FILTER_LABELS,
  feedFiltersHref,
  normalizeFeedFilters,
  parseFiltersFromSearch,
} from "@/components/feed/feed-filter-dialog";
import type { FeedContentFilters } from "@/features/feed/types/search.types";

type Key = keyof FeedContentFilters;

/** Removable chips for the filters applied to the home feed. */
export function FeedActiveFiltersBar({ onEdit }: { onEdit: () => void }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const filters = normalizeFeedFilters(parseFiltersFromSearch(`?${searchParams.toString()}`));

  const chips = (Object.keys(filters) as Key[])
    .filter((key) => filters[key] !== "all")
    .map((key) => ({
      key,
      label: (FEED_FILTER_LABELS[key] as Record<string, string>)[filters[key]] ?? filters[key],
    }));

  if (chips.length === 0) return null;

  return (
    <div className="flex flex-wrap items-center gap-1.5 rounded-[var(--radius)] border border-border bg-card px-3 py-2.5 shadow-sm">
      <button
        type="button"
        onClick={onEdit}
        className="inline-flex h-7 items-center gap-1.5 rounded-full px-2 text-xs font-semibold text-muted-foreground hover:bg-muted hover:text-foreground"
      >
        <SlidersHorizontal className="h-3.5 w-3.5" aria-hidden />
        Filtered by
      </button>
      {chips.map((chip) => (
        <span
          key={chip.key}
          className="inline-flex h-7 items-center gap-1 rounded-full border border-primary/40 bg-primary/10 pe-1 ps-3 text-xs font-medium text-primary"
        >
          {chip.label}
          <button
            type="button"
            aria-label={`Remove ${chip.label} filter`}
            onClick={() => router.push(feedFiltersHref({ ...filters, [chip.key]: "all" }))}
            className="inline-flex h-5 w-5 items-center justify-center rounded-full hover:bg-primary/20"
          >
            <X className="h-3 w-3" />
          </button>
        </span>
      ))}
      <button
        type="button"
        onClick={() => router.push("/feed")}
        className="ms-auto text-xs font-semibold text-muted-foreground hover:text-foreground hover:underline"
      >
        Clear all
      </button>
    </div>
  );
}
