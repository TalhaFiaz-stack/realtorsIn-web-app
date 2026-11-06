"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { ChevronDown, Loader2, MapPin, Search, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  formatAlgoliaLocationDisplay,
  parseAlgoliaLocationHit,
  type AlgoliaLocationHit,
  type ParsedAlgoliaLocation,
} from "@/features/properties/lib/parse-algolia-location";
import { cn } from "@/lib/utils";

const ALGOLIA_APP_ID = "5U36EWHMOU";
const ALGOLIA_SEARCH_API_KEY = "4f9b2c57107005fc972744b4d0338be4";
const ALGOLIA_INDEX_NAME = "locations";

export type PropertyLocationSelection = ParsedAlgoliaLocation;

export function PropertyLocationSearch({
  value,
  displayValue,
  onChange,
  placeholder = "Search for a location...",
  className,
  disabled = false,
}: {
  /** Mobile `location` — Algolia hit `name`. */
  value: string;
  /** Optional formatted label when parent only stores `name`. */
  displayValue?: string;
  onChange: (next: PropertyLocationSelection | null) => void;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [hits, setHits] = useState<AlgoliaLocationHit[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedHit, setSelectedHit] = useState<AlgoliaLocationHit | null>(
    null
  );
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const rootRef = useRef<HTMLDivElement | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);

  const closedLabel =
    (selectedHit ? formatAlgoliaLocationDisplay(selectedHit) : null) ||
    displayValue?.trim() ||
    value.trim();

  const search = useCallback(async (text: string) => {
    if (text.trim().length < 2) {
      setHits([]);
      return;
    }
    setLoading(true);
    try {
      const response = await fetch(
        `https://${ALGOLIA_APP_ID}-dsn.algolia.net/1/indexes/${ALGOLIA_INDEX_NAME}/query`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "X-Algolia-API-Key": ALGOLIA_SEARCH_API_KEY,
            "X-Algolia-Application-Id": ALGOLIA_APP_ID,
          },
          body: JSON.stringify({
            query: text,
            hitsPerPage: 10,
            attributesToRetrieve: [
              "objectID",
              "id",
              "name",
              "externalID",
              "level",
              "hierarchy",
              "type",
              "hasBuilding",
              "_geoloc",
              "geography",
              "geo_point",
              "building_id",
            ],
            attributesToHighlight: ["name", "hierarchy.name"],
          }),
        }
      );
      if (!response.ok) {
        setHits([]);
        return;
      }
      const data = (await response.json()) as { hits?: AlgoliaLocationHit[] };
      setHits(data.hits ?? []);
    } catch {
      setHits([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!value && selectedHit) {
      setSelectedHit(null);
    }
  }, [value, selectedHit]);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      if (open) void search(query);
    }, 300);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [query, open, search]);

  useEffect(() => {
    function onDocClick(e: MouseEvent) {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onDocClick);
    return () => document.removeEventListener("mousedown", onDocClick);
  }, []);

  function openSearch() {
    if (disabled) return;
    setOpen(true);
    setQuery(
      selectedHit
        ? formatAlgoliaLocationDisplay(selectedHit)
        : displayValue?.trim() || value.trim()
    );
    setTimeout(() => inputRef.current?.focus(), 0);
  }

  function clearSelection(e?: React.MouseEvent) {
    e?.stopPropagation();
    setSelectedHit(null);
    setQuery("");
    setHits([]);
    setOpen(false);
    onChange(null);
  }

  function selectHit(hit: AlgoliaLocationHit) {
    const parsed = parseAlgoliaLocationHit(hit);
    setSelectedHit(hit);
    onChange(parsed);
    setOpen(false);
    setQuery("");
    setHits([]);
  }

  return (
    <div ref={rootRef} className={cn("relative", className)}>
      {!open ? (
        <div
          className={cn(
            "flex h-9 w-full items-center gap-2 rounded-md border border-input bg-background px-2.5 text-sm shadow-sm",
            disabled && "opacity-50"
          )}
        >
          <button
            type="button"
            disabled={disabled}
            onClick={openSearch}
            className={cn(
              "flex min-w-0 flex-1 items-center gap-2 text-start",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30 rounded-sm"
            )}
          >
            {closedLabel ? (
              <MapPin className="h-4 w-4 shrink-0 text-muted-foreground" aria-hidden />
            ) : null}
            <span
              className={cn(
                "min-w-0 flex-1 truncate",
                closedLabel ? "text-foreground" : "text-muted-foreground"
              )}
            >
              {closedLabel || placeholder}
            </span>
          </button>
          {closedLabel && !disabled ? (
            <button
              type="button"
              className="rounded p-1 text-muted-foreground hover:bg-muted"
              aria-label="Clear location"
              onClick={clearSelection}
            >
              <X className="h-3.5 w-3.5" />
            </button>
          ) : null}
          <ChevronDown className="h-3.5 w-3.5 shrink-0 text-muted-foreground" aria-hidden />
        </div>
      ) : (
        <div className="relative">
          <Search className="pointer-events-none absolute start-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            ref={inputRef}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search locations..."
            className="locale-text h-9 ps-8 pe-16 text-sm"
            autoComplete="off"
          />
          <div className="absolute end-1.5 top-1/2 flex -translate-y-1/2 items-center gap-0.5">
            {loading ? (
              <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
            ) : query.trim() ? (
              <button
                type="button"
                className="rounded p-1 text-muted-foreground hover:bg-muted"
                aria-label="Clear search"
                onClick={() => {
                  setQuery("");
                  setHits([]);
                  setSelectedHit(null);
                  onChange(null);
                }}
              >
                <X className="h-3.5 w-3.5" />
              </button>
            ) : null}
            <button
              type="button"
              className="rounded p-1 text-muted-foreground hover:bg-muted"
              aria-label="Close location search"
              onClick={() => setOpen(false)}
            >
              <ChevronDown className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      )}

      {open && hits.length > 0 ? (
        <ul
          className="absolute z-50 mt-1 max-h-56 w-full overflow-y-auto rounded-md border border-border bg-popover py-1 shadow-md"
          role="listbox"
        >
          {hits.map((hit) => {
            const key = String(hit.externalID ?? hit.id ?? hit.name);
            const optionLabel = formatAlgoliaLocationDisplay(hit);
            const selected =
              value === hit.name ||
              selectedHit?.name === hit.name;
            return (
              <li key={key}>
                <button
                  type="button"
                  role="option"
                  aria-selected={selected}
                  className={cn(
                    "flex w-full items-start gap-2 px-3 py-2 text-start text-sm hover:bg-muted",
                    selected && "bg-muted/60"
                  )}
                  onClick={() => selectHit(hit)}
                >
                  <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
                  <span className="min-w-0 flex-1 leading-snug">{optionLabel}</span>
                </button>
              </li>
            );
          })}
        </ul>
      ) : null}
    </div>
  );
}
