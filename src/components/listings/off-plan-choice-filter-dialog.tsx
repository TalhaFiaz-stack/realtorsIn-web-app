"use client";

import { useEffect, useMemo, useState } from "react";
import { Search } from "lucide-react";
import {
  FilterChip,
  FilterChipRow,
  FilterSection,
} from "@/components/properties/property-hub-filter-ui";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import type { OffPlanFilterOption } from "@/features/off-plan/types/off-plan.types";
import { cn } from "@/lib/utils";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description?: string;
  options: OffPlanFilterOption[];
  mode: "single" | "multi";
  /** Single value or list of values (multi). Empty string / [] = cleared. */
  value: string | string[];
  onApply: (next: string | string[]) => void;
  searchable?: boolean;
  searchThreshold?: number;
  /** Max chips before "See more" (search shows all matches). */
  collapseLimit?: number;
};

const DEFAULT_COLLAPSE_LIMIT = 14;

export function OffPlanChoiceFilterDialog({
  open,
  onOpenChange,
  title,
  description,
  options,
  mode,
  value,
  onApply,
  searchable = true,
  searchThreshold = 8,
  collapseLimit = DEFAULT_COLLAPSE_LIMIT,
}: Props) {
  const [local, setLocal] = useState<string | string[]>(value);
  const [query, setQuery] = useState("");
  const [expanded, setExpanded] = useState(false);

  useEffect(() => {
    if (open) {
      setLocal(value);
      setQuery("");
      setExpanded(false);
    }
  }, [open, value]);

  useEffect(() => {
    setExpanded(false);
  }, [query]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return options;
    return options.filter((o) => o.label.toLowerCase().includes(q));
  }, [options, query]);

  const showSearch = searchable && options.length >= searchThreshold;

  const selectedValues = useMemo((): string[] => {
    if (mode === "single") {
      return typeof local === "string" && local ? [local] : [];
    }
    return Array.isArray(local) ? local : [];
  }, [local, mode]);

  const displayOptions = useMemo(() => {
    const isSearching = query.trim().length > 0;
    if (isSearching || expanded || filtered.length <= collapseLimit) {
      return filtered;
    }
    const head = filtered.slice(0, collapseLimit);
    const inHead = new Set(head.map((o) => o.value));
    const pinned = selectedValues
      .filter((v) => !inHead.has(v))
      .map((v) => filtered.find((o) => o.value === v))
      .filter((o): o is OffPlanFilterOption => o != null);
    return [...pinned, ...head];
  }, [filtered, query, expanded, collapseLimit, selectedValues]);

  const hiddenCount = Math.max(0, filtered.length - collapseLimit);
  const showExpandToggle =
    !query.trim() && filtered.length > collapseLimit;

  const isActive = (optValue: string) => {
    if (mode === "single") return local === optValue;
    return Array.isArray(local) && local.includes(optValue);
  };

  const toggle = (optValue: string) => {
    if (mode === "single") {
      setLocal(local === optValue ? "" : optValue);
      return;
    }
    const list = Array.isArray(local) ? local : [];
    setLocal(
      list.includes(optValue)
        ? list.filter((v) => v !== optValue)
        : [...list, optValue]
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex max-h-[min(90vh,640px)] flex-col gap-0 p-0 sm:max-w-md">
        <DialogHeader className="border-b border-border px-5 py-4 text-start">
          <DialogTitle className="text-base font-semibold">{title}</DialogTitle>
          {description ? (
            <DialogDescription className="text-xs text-muted-foreground">
              {description}
            </DialogDescription>
          ) : (
            <DialogDescription className="sr-only">{title}</DialogDescription>
          )}
        </DialogHeader>

        <div className="min-h-0 flex-1 space-y-4 overflow-y-auto px-5 py-4">
          {showSearch ? (
            <div className="relative">
              <Search className="absolute start-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search…"
                className="h-10 ps-9"
              />
            </div>
          ) : null}

          <FilterSection title="Options">
            {filtered.length === 0 ? (
              <p className="text-xs text-muted-foreground">No matches.</p>
            ) : (
              <div className="space-y-2">
                <FilterChipRow>
                  {displayOptions.map((opt) => (
                    <FilterChip
                      key={opt.value}
                      active={isActive(opt.value)}
                      onClick={() => toggle(opt.value)}
                      className={cn(mode === "single" && "max-w-full truncate")}
                    >
                      {opt.label}
                    </FilterChip>
                  ))}
                </FilterChipRow>
                {showExpandToggle ? (
                  <Button
                    type="button"
                    variant="link"
                    className="h-auto px-0 text-xs font-semibold text-primary"
                    onClick={() => setExpanded((v) => !v)}
                  >
                    {expanded
                      ? "See less"
                      : `See more (${hiddenCount.toLocaleString()})`}
                  </Button>
                ) : null}
              </div>
            )}
          </FilterSection>
        </div>

        <DialogFooter className="flex-row gap-2 border-t border-border bg-muted/20 px-5 py-4 sm:justify-between">
          <Button
            type="button"
            variant="ghost"
            className="text-muted-foreground"
            onClick={() => {
              setLocal(mode === "single" ? "" : []);
            }}
          >
            Clear
          </Button>
          <div className="flex gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button
              type="button"
              onClick={() => {
                onApply(local);
                onOpenChange(false);
              }}
            >
              Apply
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
