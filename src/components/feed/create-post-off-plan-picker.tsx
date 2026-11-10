"use client";

import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Building2, Loader2, Search, X } from "lucide-react";
import { RemoteImg } from "@/components/shared/remote-img";
import { Input } from "@/components/ui/input";
import type { OffPlanShareChoice } from "@/features/feed/hooks/use-create-post";
import {
  fetchOffPlanFeedSectionsClient,
  fetchOffPlanSearchSuggestionsClient,
} from "@/features/off-plan/services/off-plan.client";
import { cn } from "@/lib/utils";

/**
 * "Off Plan" tab in the post composer: search an off-plan project and attach
 * it — the post renders as the project share card (mobile parity).
 */
export function CreatePostOffPlanPicker({
  value,
  onChange,
  disabled,
}: {
  value: OffPlanShareChoice | null;
  onChange: (next: OffPlanShareChoice | null) => void;
  disabled?: boolean;
}) {
  const [text, setText] = useState("");
  const [debounced, setDebounced] = useState("");

  useEffect(() => {
    const t = window.setTimeout(() => setDebounced(text.trim()), 300);
    return () => window.clearTimeout(t);
  }, [text]);

  /** The server only searches from 2 characters — below that, don't call it. */
  const searching = debounced.length >= 2;

  const searchQuery = useQuery({
    queryKey: ["off-plan", "compose-picker", debounced],
    queryFn: ({ signal }) => fetchOffPlanSearchSuggestionsClient(debounced, signal),
    enabled: !value && searching,
    staleTime: 60_000,
  });

  // Before typing: show "Top Picks" (same lightweight feed endpoint as the
  // home feed's off-plan row) instead of an empty search.
  const topQuery = useQuery({
    queryKey: ["off-plan", "compose-picker-top"],
    queryFn: ({ signal }) =>
      fetchOffPlanFeedSectionsClient(null, signal).then((res) => res.sections ?? []),
    enabled: !value && !searching,
    staleTime: 10 * 60_000,
  });

  const query = searching ? searchQuery : topQuery;

  const choices: OffPlanShareChoice[] = searching
    ? (searchQuery.data?.sections?.projects ?? [])
        .filter((r) => r.id != null && String(r.id).trim())
        .slice(0, 8)
        .map((r) => ({
          id: String(r.id),
          label: r.label,
          subtitle: r.subtitle,
          imageUrl: r.imageUrl,
          developerName: r.developerName,
        }))
    : (topQuery.data?.find((section) => section.key === "top_overall")?.projects ?? [])
        .slice(0, 8)
        .map((p) => ({
          id: p.id,
          label: p.title,
          subtitle: p.location ?? p.districtName ?? undefined,
          imageUrl: p.bannerImage ?? undefined,
          developerName: p.developerName ?? undefined,
        }));

  if (value) {
    return (
      <div className="flex items-center gap-3 rounded-xl border border-primary/30 bg-primary/5 p-2.5">
        <span className="relative h-14 w-20 shrink-0 overflow-hidden rounded-lg bg-muted">
          {value.imageUrl ? (
            <RemoteImg src={value.imageUrl} alt="" wrapperClassName="absolute inset-0" className="h-full w-full object-cover" />
          ) : (
            <Building2 className="absolute inset-0 m-auto h-6 w-6 text-muted-foreground" aria-hidden />
          )}
        </span>
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-semibold text-foreground">{value.label}</p>
          <p className="truncate text-xs text-muted-foreground">
            {[value.developerName && `by ${value.developerName}`, value.subtitle].filter(Boolean).join(" · ") ||
              "Off-plan project"}
          </p>
          <p className="mt-0.5 text-[11px] font-medium text-primary">Shared as a project card</p>
        </div>
        <button
          type="button"
          disabled={disabled}
          onClick={() => onChange(null)}
          className="inline-flex h-8 shrink-0 items-center gap-1 rounded-full border border-border bg-background px-3 text-xs font-semibold hover:bg-muted"
        >
          <X className="h-3.5 w-3.5" aria-hidden />
          Change
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-2 rounded-xl border border-border bg-muted/20 p-3">
      <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
        {searching ? "Search results" : "Top picks — or search for any project"}
      </p>
      <div className="relative">
        <Search className="pointer-events-none absolute start-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" aria-hidden />
        <Input
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Search projects, e.g. Emaar Beachfront"
          className="ps-9"
          disabled={disabled}
          autoFocus
        />
        {query.isFetching ? (
          <Loader2 className="absolute end-3 top-1/2 h-4 w-4 -translate-y-1/2 animate-spin text-muted-foreground" aria-hidden />
        ) : null}
      </div>
      <div className="max-h-56 space-y-1 overflow-y-auto">
        {query.isLoading ? (
          <p className="px-1 py-3 text-sm text-muted-foreground">Loading projects…</p>
        ) : query.isError ? (
          <p className="px-1 py-3 text-sm text-muted-foreground">
            Couldn’t load projects.{" "}
            <button type="button" className="font-semibold text-primary hover:underline" onClick={() => void query.refetch()}>
              Retry
            </button>
          </p>
        ) : choices.length === 0 ? (
          <p className="px-1 py-3 text-sm text-muted-foreground">
            {searching
              ? `No projects match “${debounced}”.`
              : debounced
                ? "Keep typing — at least 2 characters."
                : "Type to search off-plan projects."}
          </p>
        ) : (
          choices.map((choice) => (
            <button
              key={choice.id}
              type="button"
              disabled={disabled}
              onClick={() => onChange(choice)}
              className={cn(
                "flex w-full items-center gap-3 rounded-lg px-2 py-2 text-start transition-colors hover:bg-muted",
                disabled && "opacity-60"
              )}
            >
              <span className="relative h-10 w-14 shrink-0 overflow-hidden rounded-md bg-muted">
                {choice.imageUrl ? (
                  <RemoteImg src={choice.imageUrl} alt="" wrapperClassName="absolute inset-0" className="h-full w-full object-cover" />
                ) : (
                  <Building2 className="absolute inset-0 m-auto h-5 w-5 text-muted-foreground" aria-hidden />
                )}
              </span>
              <span className="min-w-0 flex-1">
                <span className="block truncate text-sm font-semibold text-foreground">{choice.label}</span>
                <span className="block truncate text-xs text-muted-foreground">
                  {[choice.developerName, choice.subtitle].filter(Boolean).join(" · ") || "Off-plan project"}
                </span>
              </span>
            </button>
          ))
        )}
      </div>
    </div>
  );
}
