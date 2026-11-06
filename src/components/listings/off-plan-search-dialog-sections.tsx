"use client";

import { useMemo, useState } from "react";
import {
  Building2,
  ChevronDown,
  History,
  MapPin,
  TrendingUp,
} from "lucide-react";
import { RemoteImg } from "@/components/shared/remote-img";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import type { OffPlanSearchChoice } from "@/features/off-plan/types/off-plan-search.types";
import { cn } from "@/lib/utils";

const SEE_MORE_THRESHOLD = 6;

function highlightParts(title: string, query: string) {
  const full = title;
  const q = query.trim();
  if (!q) return [{ text: full, match: false }];
  const idx = full.toLowerCase().indexOf(q.toLowerCase());
  if (idx < 0) return [{ text: full, match: false }];
  const parts: { text: string; match: boolean }[] = [];
  if (idx > 0) parts.push({ text: full.slice(0, idx), match: false });
  parts.push({ text: full.slice(idx, idx + q.length), match: true });
  if (idx + q.length < full.length) {
    parts.push({ text: full.slice(idx + q.length), match: false });
  }
  return parts;
}

function SectionTitle({
  title,
  expanded,
  onToggle,
}: {
  title: string;
  expanded: boolean;
  onToggle: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onToggle}
      className="mb-3 flex w-full items-center gap-2 text-start"
    >
      <TrendingUp className="h-4 w-4 shrink-0 text-muted-foreground" />
      <span className="min-w-0 flex-1 text-sm font-bold text-foreground">
        {title}
      </span>
      <ChevronDown
        className={cn(
          "h-4 w-4 shrink-0 text-muted-foreground transition",
          expanded && "rotate-180"
        )}
      />
    </button>
  );
}

function IdleProjectBlockSkeleton({ rows = 3 }: { rows?: number }) {
  return (
    <ul className="divide-y divide-border/60 rounded-xl border border-border/70 bg-card/50">
      {Array.from({ length: rows }).map((_, i) => (
        <li key={i} className="flex items-center gap-3 px-3 py-2.5">
          <Skeleton className="h-11 w-11 shrink-0 rounded-lg" />
          <span className="min-w-0 flex-1 space-y-2">
            <Skeleton className="h-4 w-[72%] max-w-full" />
            <Skeleton className="h-3 w-[45%] max-w-full" />
          </span>
          <Skeleton className="h-5 w-14 shrink-0 rounded-md" />
        </li>
      ))}
    </ul>
  );
}

function IdleChipBlockSkeleton({ chips = 8 }: { chips?: number }) {
  return (
    <div className="flex flex-wrap gap-2">
      {Array.from({ length: chips }).map((_, i) => (
        <Skeleton
          key={i}
          className={cn("h-8 rounded-full", i % 3 === 0 ? "w-24" : i % 3 === 1 ? "w-20" : "w-[4.5rem]")}
        />
      ))}
    </div>
  );
}

export function OffPlanSearchDialogContentSkeleton({
  variant,
}: {
  variant: "idle" | "typing";
}) {
  if (variant === "typing") {
    return (
      <div className="space-y-4" aria-hidden>
        {(["Cities", "Districts", "Projects"] as const).map((label) => (
          <section key={label}>
            <Skeleton className="mb-2 h-3 w-16" />
            <div className="rounded-xl border border-border/60 bg-card/40 px-2">
              {Array.from({ length: 4 }).map((_, i) => (
                <div
                  key={i}
                  className="flex items-center gap-3 border-b border-border/50 px-1 py-3 last:border-b-0"
                >
                  <Skeleton className="h-4 w-4 shrink-0 rounded-sm" />
                  <span className="min-w-0 flex-1 space-y-2">
                    <Skeleton className={cn("h-4 max-w-full", i % 2 === 0 ? "w-[88%]" : "w-[76%]")} />
                    <Skeleton className="h-3 w-24" />
                  </span>
                </div>
              ))}
            </div>
          </section>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-5" aria-hidden>
      <section>
        <div className="mb-3 flex items-center gap-2">
          <Skeleton className="h-4 w-4 shrink-0 rounded-sm" />
          <Skeleton className="h-4 w-28" />
          <Skeleton className="ms-auto h-4 w-4 shrink-0 rounded-sm" />
        </div>
        <IdleProjectBlockSkeleton rows={3} />
      </section>
      <section>
        <div className="mb-3 flex items-center gap-2">
          <Skeleton className="h-4 w-4 shrink-0 rounded-sm" />
          <Skeleton className="h-4 w-32" />
          <Skeleton className="ms-auto h-4 w-4 shrink-0 rounded-sm" />
        </div>
        <IdleProjectBlockSkeleton rows={4} />
      </section>
      <section>
        <div className="mb-3 flex items-center gap-2">
          <Skeleton className="h-4 w-4 shrink-0 rounded-sm" />
          <Skeleton className="h-4 w-28" />
          <Skeleton className="ms-auto h-4 w-4 shrink-0 rounded-sm" />
        </div>
        <IdleChipBlockSkeleton chips={8} />
      </section>
      <section>
        <div className="mb-3 flex items-center gap-2">
          <Skeleton className="h-4 w-4 shrink-0 rounded-sm" />
          <Skeleton className="h-4 w-32" />
          <Skeleton className="ms-auto h-4 w-4 shrink-0 rounded-sm" />
        </div>
        <IdleChipBlockSkeleton chips={6} />
      </section>
    </div>
  );
}

export function OffPlanSearchRecentSection({
  items,
  isSelected,
  onSelect,
  onClearAll,
}: {
  items: string[];
  isSelected: (item: string) => boolean;
  onSelect: (item: string) => void;
  onClearAll: () => void;
}) {
  if (!items.length) return null;
  return (
    <section className="space-y-3">
      <h3 className="flex items-center gap-2 text-sm font-bold text-foreground">
        <History className="h-4 w-4 text-muted-foreground" />
        Recently searched
      </h3>
      <div className="flex gap-2 overflow-x-auto pb-1">
        {items.map((label) => {
          const active = isSelected(label);
          return (
            <button
              key={label}
              type="button"
              onClick={() => onSelect(label)}
              className={cn(
                "inline-flex max-w-[14rem] shrink-0 items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium transition",
                active
                  ? "border-primary/40 bg-primary/10 text-primary"
                  : "border-border/80 bg-muted/30 hover:bg-muted/50"
              )}
            >
              <MapPin className="h-3.5 w-3.5 shrink-0 opacity-70" />
              <span className="line-clamp-2 text-start">{label}</span>
            </button>
          );
        })}
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="shrink-0 gap-1 text-xs text-primary"
          onClick={onClearAll}
        >
          Clear all
        </Button>
      </div>
    </section>
  );
}

export function OffPlanSearchChipSection({
  title,
  items,
  isSelected,
  onToggle,
}: {
  title: string;
  items: OffPlanSearchChoice[];
  isSelected: (item: OffPlanSearchChoice) => boolean;
  onToggle: (item: OffPlanSearchChoice) => void;
}) {
  const [expanded, setExpanded] = useState(true);
  const [showAll, setShowAll] = useState(false);
  const hasMany = items.length > SEE_MORE_THRESHOLD;
  const displayed = useMemo(() => {
    if (!hasMany || showAll) return items;
    return items.slice(0, SEE_MORE_THRESHOLD);
  }, [hasMany, items, showAll]);

  if (!items.length) return null;

  return (
    <section>
      <SectionTitle
        title={title}
        expanded={expanded}
        onToggle={() => setExpanded((v) => !v)}
      />
      {expanded ? (
        <div className="flex flex-wrap gap-2">
          {displayed.map((item) => {
            const active = isSelected(item);
            return (
              <button
                key={`${item.detailType}-${item.id}`}
                type="button"
                onClick={() => onToggle(item)}
                className={cn(
                  "rounded-full border px-3 py-1.5 text-xs font-medium transition",
                  active
                    ? "border-primary/40 bg-primary/10 text-primary"
                    : "border-border/80 bg-muted/20 hover:bg-muted/45"
                )}
              >
                {item.label}
              </button>
            );
          })}
          {hasMany ? (
            <button
              type="button"
              className="text-xs font-semibold text-primary"
              onClick={() => setShowAll((v) => !v)}
            >
              {showAll ? "See less" : "See more"}
            </button>
          ) : null}
        </div>
      ) : null}
    </section>
  );
}

export function OffPlanSearchProjectSection({
  title,
  items,
  isSelected,
  onToggle,
}: {
  title: string;
  items: OffPlanSearchChoice[];
  isSelected: (item: OffPlanSearchChoice) => boolean;
  onToggle: (item: OffPlanSearchChoice) => void;
}) {
  const [expanded, setExpanded] = useState(true);
  if (!items.length) return null;

  return (
    <section>
      <SectionTitle
        title={title}
        expanded={expanded}
        onToggle={() => setExpanded((v) => !v)}
      />
      {expanded ? (
        <ul className="divide-y divide-border/60 rounded-xl border border-border/70 bg-card/50">
          {items.map((item) => {
            const active = isSelected(item);
            const sub = item.developerName ?? item.subtitle ?? "";
            return (
              <li key={`${item.detailType}-${item.id}`}>
                <button
                  type="button"
                  onClick={() => onToggle(item)}
                  className={cn(
                    "flex w-full items-center gap-3 px-3 py-2.5 text-start transition",
                    active ? "bg-primary/5" : "hover:bg-muted/40"
                  )}
                >
                  <div className="relative h-11 w-11 shrink-0 overflow-hidden rounded-lg bg-muted">
                    {item.imageUrl ? (
                      <RemoteImg
                        src={item.imageUrl}
                        alt=""
                        className="h-full w-full object-cover"
                        wrapperClassName="h-full w-full"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center">
                        <Building2 className="h-4 w-4 text-muted-foreground" />
                      </div>
                    )}
                  </div>
                  <span className="min-w-0 flex-1">
                    <span className="line-clamp-1 text-sm font-semibold">
                      {item.label}
                    </span>
                    {sub ? (
                      <span className="line-clamp-1 text-xs text-muted-foreground">
                        {sub}
                      </span>
                    ) : null}
                  </span>
                  {item.statusLabel ? (
                    <span className="shrink-0 rounded-md bg-muted px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-foreground">
                      {item.statusLabel}
                    </span>
                  ) : null}
                </button>
              </li>
            );
          })}
        </ul>
      ) : null}
    </section>
  );
}

function SuggestionKindIcon({ kind }: { kind: OffPlanSearchChoice["detailType"] }) {
  if (kind === "developer" || kind === "project") {
    return <Building2 className="h-4 w-4 shrink-0 text-muted-foreground" />;
  }
  return <MapPin className="h-4 w-4 shrink-0 text-muted-foreground" />;
}

function SearchFlatRow({
  item,
  query,
  selected,
  onPress,
  subtitle,
}: {
  item: OffPlanSearchChoice;
  query: string;
  selected: boolean;
  onPress: () => void;
  subtitle?: string;
}) {
  const parts = highlightParts(item.label, query);
  return (
    <button
      type="button"
      onClick={onPress}
      className={cn(
        "flex w-full items-center gap-3 border-b border-border/50 px-1 py-3 text-start last:border-b-0",
        selected && "bg-primary/5"
      )}
    >
      <SuggestionKindIcon kind={item.detailType} />
      <span className="min-w-0 flex-1">
        <span className="line-clamp-2 text-sm">
          {parts.map((p, i) => (
            <span
              key={i}
              className={p.match ? "font-bold text-foreground" : "text-foreground/90"}
            >
              {p.text}
            </span>
          ))}
        </span>
        {subtitle ? (
          <span className="text-xs text-muted-foreground">{subtitle}</span>
        ) : null}
      </span>
    </button>
  );
}

export function OffPlanSearchSuggestionList({
  sections,
  query,
  isSelected,
  onToggle,
}: {
  sections: {
    cities: OffPlanSearchChoice[];
    districts: OffPlanSearchChoice[];
    projects: OffPlanSearchChoice[];
    developers: OffPlanSearchChoice[];
  };
  query: string;
  isSelected: (item: OffPlanSearchChoice) => boolean;
  onToggle: (item: OffPlanSearchChoice) => void;
}) {
  const blocks: {
    title: string;
    items: OffPlanSearchChoice[];
    subtitle?: (item: OffPlanSearchChoice) => string;
  }[] = [
    { title: "Cities", items: sections.cities, subtitle: () => "City" },
    {
      title: "Districts",
      items: sections.districts,
      subtitle: (item) =>
        item.count != null ? `${item.count} projects` : "District",
    },
    { title: "Projects", items: sections.projects },
    {
      title: "Developers",
      items: sections.developers,
      subtitle: () => "Developer",
    },
  ];

  return (
    <div className="space-y-4">
      {blocks.map((block) =>
        block.items.length ? (
          <section key={block.title}>
            <h3 className="mb-1 text-[11px] font-bold uppercase tracking-[0.12em] text-muted-foreground">
              {block.title}
            </h3>
            <div className="rounded-xl border border-border/60 bg-card/40 px-2">
              {block.items.map((item) => (
                <SearchFlatRow
                  key={`${item.detailType}-${item.id}`}
                  item={item}
                  query={query}
                  selected={isSelected(item)}
                  onPress={() => onToggle(item)}
                  subtitle={block.subtitle?.(item)}
                />
              ))}
            </div>
          </section>
        ) : null
      )}
    </div>
  );
}
