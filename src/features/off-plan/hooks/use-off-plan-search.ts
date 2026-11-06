"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  clearOffPlanSearchRecents,
  loadOffPlanSearchRecents,
} from "@/features/off-plan/lib/off-plan-search-apply";
import { resolveOffPlanRecentLabelToPick } from "@/features/off-plan/lib/off-plan-search-recent";
import {
  fetchOffPlanPopularSearchClient,
  fetchOffPlanSearchSuggestionsClient,
} from "@/features/off-plan/services/off-plan.client";
import type { OffPlanSearchChoice } from "@/features/off-plan/types/off-plan-search.types";
import type {
  OffPlanDistrict,
  OffPlanFilterMeta,
} from "@/features/off-plan/types/off-plan.types";

const MIN_QUERY = 2;
const DEBOUNCE_MS = 150;

const EMPTY_SECTIONS = {
  featuredProjects: [] as OffPlanSearchChoice[],
  projects: [] as OffPlanSearchChoice[],
  cities: [] as OffPlanSearchChoice[],
  districts: [] as OffPlanSearchChoice[],
  developers: [] as OffPlanSearchChoice[],
};

function pickKey(p: OffPlanSearchChoice) {
  return `${p.detailType}:${String(p.id)}`;
}

type SearchCtx = {
  districts: OffPlanDistrict[];
  filterMeta: OffPlanFilterMeta;
};

export function useOffPlanSearch(open: boolean, ctx?: SearchCtx) {
  const [localQuery, setLocalQuery] = useState("");
  const [selectedChoices, setSelectedChoices] = useState<OffPlanSearchChoice[]>(
    []
  );
  const [recents, setRecents] = useState<string[]>([]);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [debouncedQuery, setDebouncedQuery] = useState("");

  useEffect(() => {
    if (open) {
      setRecents(loadOffPlanSearchRecents());
    }
  }, [open]);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    const q = localQuery.trim();
    if (q.length < MIN_QUERY) {
      setDebouncedQuery("");
      return;
    }
    debounceRef.current = setTimeout(() => setDebouncedQuery(q), DEBOUNCE_MS);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [localQuery]);

  const popularQuery = useQuery({
    queryKey: ["off-plan", "search", "popular"],
    queryFn: ({ signal }) => fetchOffPlanPopularSearchClient(signal),
    enabled: open,
    staleTime: 5 * 60 * 1000,
  });

  const suggestionsQuery = useQuery({
    queryKey: ["off-plan", "search", "suggestions", debouncedQuery],
    queryFn: ({ signal }) =>
      fetchOffPlanSearchSuggestionsClient(debouncedQuery, signal),
    enabled: open && debouncedQuery.length >= MIN_QUERY,
    staleTime: 60 * 1000,
  });

  const popularSections = popularQuery.data?.sections ?? EMPTY_SECTIONS;
  const suggestionSections = suggestionsQuery.data?.sections ?? EMPTY_SECTIONS;

  const showSearchResults = localQuery.trim().length >= MIN_QUERY;
  const listSections = showSearchResults ? suggestionSections : popularSections;
  const listLoading = showSearchResults
    ? suggestionsQuery.isFetching
    : popularQuery.isLoading;

  const emptyList = showSearchResults
    ? !listSections.cities.length &&
      !listSections.districts.length &&
      !listSections.projects.length &&
      !listSections.developers.length
    : !popularSections.featuredProjects.length &&
      !popularSections.projects.length &&
      !popularSections.cities.length &&
      !popularSections.districts.length;

  const hasIdleBrowseContent =
    popularSections.featuredProjects.length > 0 ||
    popularSections.projects.length > 0 ||
    popularSections.cities.length > 0 ||
    popularSections.districts.length > 0;

  const resolveCtx = useMemo(
    () => ({
      popularCities: popularSections.cities,
      popularDistricts: popularSections.districts,
      suggestionCities: suggestionSections.cities,
      suggestionDistricts: suggestionSections.districts,
      districts: ctx?.districts ?? [],
      developers: ctx?.filterMeta.developers ?? [],
    }),
    [ctx, popularSections, suggestionSections]
  );

  const normalizePick = useCallback(
    (input: string | OffPlanSearchChoice): OffPlanSearchChoice | null => {
      if (typeof input === "string") {
        const s = input.trim();
        if (!s) return null;
        const resolved = resolveOffPlanRecentLabelToPick(s, resolveCtx);
        if (resolved) return resolved;
        return { detailType: "text", id: s, label: s };
      }
      const label = String(input.label ?? "").trim();
      if (!input.detailType || input.id == null || !label) return null;
      return { ...input, label };
    },
    [resolveCtx]
  );

  const selectSuggestion = useCallback(
    (input: string | OffPlanSearchChoice) => {
      const pick = normalizePick(input);
      if (!pick) return;
      const key = pickKey(pick);
      let added = false;
      setSelectedChoices((prev) => {
        const idx = prev.findIndex((p) => pickKey(p) === key);
        if (idx >= 0) {
          return prev.filter((_, i) => i !== idx);
        }
        added = true;
        if (pick.detailType === "city") {
          return [...prev.filter((p) => p.detailType !== "city"), pick];
        }
        if (pick.detailType === "district") {
          return [...prev.filter((p) => p.detailType !== "district"), pick];
        }
        return [...prev, pick];
      });
      if (added) {
        setLocalQuery("");
      }
    },
    [normalizePick]
  );

  const isRowSelected = useCallback(
    (item: string | OffPlanSearchChoice) => {
      if (typeof item !== "string" && item.detailType != null && item.id != null) {
        const k = pickKey(item);
        return selectedChoices.some((p) => pickKey(p) === k);
      }
      const raw =
        typeof item === "string"
          ? item.trim()
          : String(item.label ?? "").trim();
      if (!raw) return false;
      const resolved = resolveOffPlanRecentLabelToPick(raw, resolveCtx);
      if (resolved) {
        const rk = pickKey(resolved);
        return selectedChoices.some((p) => pickKey(p) === rk);
      }
      const t = raw.toLowerCase();
      return selectedChoices.some(
        (p) =>
          p.detailType === "text" &&
          String(p.label ?? "")
            .trim()
            .toLowerCase() === t
      );
    },
    [resolveCtx, selectedChoices]
  );

  const clearSelectionOnly = useCallback(() => {
    setLocalQuery("");
    setSelectedChoices([]);
  }, []);

  const clearAllRecents = useCallback(() => {
    clearOffPlanSearchRecents();
    setRecents([]);
  }, []);

  const syncFromApplied = useCallback(
    (choices: OffPlanSearchChoice[], query: string) => {
      setSelectedChoices(choices);
      setLocalQuery(query);
    },
    []
  );

  const recentsForDisplay = useMemo(() => {
    const q = localQuery.trim().toLowerCase();
    const selectedLabels = new Set(
      selectedChoices.map((p) => p.label.trim().toLowerCase())
    );
    return recents.filter((item) => {
      const raw = item.trim();
      if (!raw) return false;
      if (q && raw.toLowerCase() === q) return false;
      if (selectedLabels.has(raw.toLowerCase())) return false;
      return !isRowSelected(raw);
    });
  }, [recents, localQuery, selectedChoices, isRowSelected]);

  return {
    localQuery,
    setLocalQuery,
    selectedChoices,
    selectSuggestion,
    isRowSelected,
    clearSelectionOnly,
    clearAllRecents,
    syncFromApplied,
    listSections,
    popularSections,
    listLoading,
    showSearchResults,
    emptyList,
    hasIdleBrowseContent,
    recentsForDisplay,
  };
}
