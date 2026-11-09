import type { OffPlanFilterDraft } from "@/features/off-plan/services/off-plan.client";
import type {
  OffPlanSearchApplyPayload,
  OffPlanSearchChoice,
} from "@/features/off-plan/types/off-plan-search.types";
import type {
  OffPlanDistrict,
  OffPlanFilterMeta,
} from "@/features/off-plan/types/off-plan.types";

const RECENTS_KEY = "realtorsin.off_plan_search_recents";

export function buildOffPlanSearchApplyPayload(
  selectedChoices: OffPlanSearchChoice[],
  localQuery: string
): OffPlanSearchApplyPayload {
  const typed = String(localQuery ?? "").trim();
  const list = Array.isArray(selectedChoices) ? selectedChoices : [];
  const cities = list.filter((c) => c.detailType === "city");
  const districts = list.filter((c) => c.detailType === "district");
  const projects = list.filter((c) => c.detailType === "project");
  const developers = list.filter((c) => c.detailType === "developer");
  const texts = list.filter((c) => c.detailType === "text");

  const hasStructuredPick =
    cities.length > 0 ||
    districts.length > 0 ||
    projects.length > 0 ||
    developers.length > 0;

  const searchParts = [
    ...texts.map((t) => String(t.label ?? "").trim()),
    ...(hasStructuredPick ? [] : [typed]),
  ].filter(Boolean);

  const firstCity = cities[0];
  const firstDistrict = districts[0];

  return {
    searchText: searchParts.join(" ").trim(),
    cityId:
      firstCity?.id != null && firstCity.id !== ""
        ? String(firstCity.id)
        : undefined,
    cityLabel: firstCity?.label,
    districtId:
      firstDistrict?.id != null && firstDistrict.id !== ""
        ? String(firstDistrict.id)
        : undefined,
    districtLabel: firstDistrict?.label,
    developerIds: developers
      .map((d) => String(d.id))
      .filter((id) => id && id !== "undefined"),
    searchProjectIds: projects
      .map((p) => String(p.id))
      .filter((id) => id && id !== "undefined"),
  };
}

export function clearOffPlanSearchFromFilters(
  draft: OffPlanFilterDraft
): OffPlanFilterDraft {
  const next = { ...draft };
  delete next.searchText;
  delete next.cityId;
  delete next.districtId;
  delete next.developerIds;
  delete next.searchProjectIds;
  return next;
}

export function applyOffPlanSearchPayloadToFilters(
  draft: OffPlanFilterDraft,
  payload: OffPlanSearchApplyPayload
): OffPlanFilterDraft {
  return {
    ...draft,
    searchText: payload.searchText || undefined,
    cityId: payload.cityId,
    districtId: payload.districtId,
    developerIds: payload.developerIds.length ? payload.developerIds : undefined,
    searchProjectIds: payload.searchProjectIds.length
      ? payload.searchProjectIds
      : undefined,
  };
}

export function buildInitialOffPlanSearchChoices(
  draft: OffPlanFilterDraft,
  meta: OffPlanFilterMeta,
  districts: OffPlanDistrict[]
): OffPlanSearchChoice[] {
  const choices: OffPlanSearchChoice[] = [];

  if (draft.cityId) {
    const fromMeta = meta.cities.find((c) => c.value === draft.cityId)?.label;
    const fromDistrict = districts.find(
      (d) => String(d.cityId) === draft.cityId
    )?.cityName;
    choices.push({
      detailType: "city",
      id: draft.cityId,
      label: fromMeta ?? fromDistrict ?? draft.cityId,
    });
  }

  if (draft.districtId) {
    const d = districts.find((x) => String(x.id) === draft.districtId);
    choices.push({
      detailType: "district",
      id: draft.districtId,
      label: d?.title ?? draft.districtId,
    });
  }

  for (const devId of draft.developerIds ?? []) {
    const dev = meta.developers.find((d) => d.value === String(devId));
    choices.push({
      detailType: "developer",
      id: devId,
      label: dev?.label ?? String(devId),
    });
  }

  for (const pid of draft.searchProjectIds ?? []) {
    choices.push({
      detailType: "project",
      id: pid,
      label: String(pid),
    });
  }

  return choices;
}

export function offPlanSearchSummaryFromDraft(draft: OffPlanFilterDraft): string {
  const parts: string[] = [];
  if (draft.searchText?.trim()) parts.push(draft.searchText.trim());
  if (draft.searchProjectIds?.length) {
    parts.push(
      draft.searchProjectIds.length === 1
        ? "1 project"
        : `${draft.searchProjectIds.length} projects`
    );
  }
  // City, district and developers already show as highlighted filter pills
  // under the search box — repeating them here read as a stray "City" query.
  return parts.join(" · ");
}

export function loadOffPlanSearchRecents(): string[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(RECENTS_KEY);
    const parsed = raw ? (JSON.parse(raw) as unknown) : [];
    return Array.isArray(parsed)
      ? parsed.filter((x): x is string => typeof x === "string")
      : [];
  } catch {
    return [];
  }
}

export function clearOffPlanSearchRecents() {
  saveOffPlanSearchRecents([]);
}

export function saveOffPlanSearchRecents(items: string[]) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(RECENTS_KEY, JSON.stringify(items.slice(0, 12)));
  } catch {
    /* ignore */
  }
}

export function pushOffPlanSearchRecents(labels: string[]) {
  const items = labels.map((l) => l.trim()).filter(Boolean);
  let next = loadOffPlanSearchRecents();
  for (let i = items.length - 1; i >= 0; i--) {
    next = [items[i], ...next.filter((x) => x !== items[i])];
  }
  saveOffPlanSearchRecents(next.slice(0, 12));
}

export function buildOffPlanRecentItems(
  selectedChoices: OffPlanSearchChoice[],
  localQuery: string
): string[] {
  const typed = String(localQuery ?? "").trim();
  const chipLabels = selectedChoices
    .map((c) => String(c.label ?? "").trim())
    .filter(Boolean);
  return [typed, ...chipLabels].filter(Boolean);
}
