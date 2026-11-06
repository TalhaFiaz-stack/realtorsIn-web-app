import { fetchEventsPage } from "@/features/events/services/events.server";
import type { EventsHubTab } from "@/features/events/types/event.types";
import { handleBffError, jsonOk } from "@/lib/auth/bff";

const TABS: EventsHubTab[] = [
  "upcoming",
  "going",
  "invited",
  "hosting",
  "past",
];

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const tabParam = searchParams.get("tab") ?? "upcoming";
    const tab = TABS.includes(tabParam as EventsHubTab)
      ? (tabParam as EventsHubTab)
      : "upcoming";
    const page = Math.max(1, Number(searchParams.get("page")) || 1);
    const q = searchParams.get("q")?.trim() || undefined;
    const startDate = searchParams.get("startDate")?.trim() || undefined;
    const endDate = searchParams.get("endDate")?.trim() || undefined;

    const pageData = await fetchEventsPage(tab, page, {
      q,
      startDate,
      endDate,
    });
    return jsonOk({ ok: true, ...pageData });
  } catch (error) {
    return handleBffError(error);
  }
}
