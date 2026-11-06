"use client";

import { useEffect, useMemo, useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";
import {
  FilterChip,
  FilterChipRow,
} from "@/components/properties/property-hub-filter-ui";
import { Button } from "@/components/ui/button";
import type { PropertyHubFilterOption } from "@/features/properties/types/property-hub-filter.types";

const DEFAULT_VISIBLE = 10;

function visibleOptions(
  options: PropertyHubFilterOption[],
  selectedValues: string[],
  expanded: boolean,
  limit: number
) {
  if (expanded || options.length <= limit) return options;

  const head = options.slice(0, limit);
  const headValues = new Set(head.map((o) => o.value));
  const extraSelected = options.filter(
    (opt) => selectedValues.includes(opt.value) && !headValues.has(opt.value)
  );
  return [...head, ...extraSelected];
}

export function ExpandableFilterChipList({
  options,
  selectedValues,
  onToggle,
  chipClassName,
  initialVisible = DEFAULT_VISIBLE,
  dialogOpen,
}: {
  options: PropertyHubFilterOption[];
  selectedValues: string[];
  onToggle: (value: string) => void;
  chipClassName?: string;
  initialVisible?: number;
  /** Collapse when the filters dialog is opened again. */
  dialogOpen?: boolean;
}) {
  const [expanded, setExpanded] = useState(false);

  useEffect(() => {
    if (dialogOpen) setExpanded(false);
  }, [dialogOpen]);

  const visible = useMemo(
    () => visibleOptions(options, selectedValues, expanded, initialVisible),
    [options, selectedValues, expanded, initialVisible]
  );

  const canExpand = options.length > initialVisible;

  return (
    <div className="space-y-2">
      <FilterChipRow>
        {visible.map((opt) => {
          const active = selectedValues.includes(opt.value);
          return (
            <FilterChip
              key={opt.value}
              active={active}
              className={chipClassName}
              onClick={() => onToggle(opt.value)}
            >
              {opt.label}
            </FilterChip>
          );
        })}
      </FilterChipRow>

      {canExpand ? (
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="h-8 gap-1 px-2 text-xs font-semibold text-primary hover:text-primary"
          onClick={() => setExpanded((v) => !v)}
        >
          {expanded ? (
            <>
              See less
              <ChevronUp className="h-3.5 w-3.5" aria-hidden />
            </>
          ) : (
            <>
              See more ({options.length - initialVisible} more)
              <ChevronDown className="h-3.5 w-3.5" aria-hidden />
            </>
          )}
        </Button>
      ) : null}
    </div>
  );
}
