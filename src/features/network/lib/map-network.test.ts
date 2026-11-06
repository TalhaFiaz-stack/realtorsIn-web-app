import { describe, expect, it } from "vitest";
import {
  isBackendSuccess,
  mapAccountSearch,
  mapConnectionsList,
  mapNetworkPerson,
  mapSuggestions,
} from "@/features/network/lib/map-network";

describe("mapNetworkPerson", () => {
  it("maps connection list rows", () => {
    const person = mapNetworkPerson({
      connection_id: 9,
      user_id: 44,
      name: "Sam Broker",
      user_name: "sam",
      profile_image: "https://cdn.example/a.jpg",
      company: "REM",
      user_role: "Agent",
      status: "accepted",
      initiated_by_me: true,
      mutual_connections_count: 2,
    });
    expect(person).toMatchObject({
      connectionId: 9,
      userId: 44,
      name: "Sam Broker",
      status: "accepted",
      initiatedByMe: true,
      mutualCount: 2,
    });
  });

  it("returns null for invalid rows", () => {
    expect(mapNetworkPerson(null)).toBeNull();
  });
});

describe("mapConnectionsList", () => {
  it("maps pagination and counters", () => {
    const page = mapConnectionsList({
      status: true,
      pending_sent: 1,
      pending_received: 3,
      total_connections: 10,
      data: [{ connection_id: 1, user_id: 2, name: "A", status: "accepted" }],
      pagination: {
        current_page: 1,
        per_page: 20,
        total: 1,
        total_pages: 1,
      },
    });
    expect(page.people).toHaveLength(1);
    expect(page.pendingReceived).toBe(3);
    expect(page.totalConnections).toBe(10);
  });
});

describe("mapSuggestions", () => {
  it("maps suggestion rows", () => {
    const page = mapSuggestions({
      status: true,
      data: [
        {
          user_id: 7,
          name: "Suggested",
          suggestion_reason: "Mutual connections",
        },
      ],
      pagination: { current_page: 1, per_page: 10, total: 1, total_pages: 1 },
    });
    expect(page.people[0]?.suggestionReason).toBe("Mutual connections");
  });
});

describe("mapAccountSearch", () => {
  it("reads nested posts/list account envelope", () => {
    const people = mapAccountSearch({
      status: true,
      data: {
        data: [{ user_id: 5, full_name: "Search Hit", user_name: "hit" }],
      },
    });
    expect(people).toHaveLength(1);
    expect(people[0]?.name).toBe("Search Hit");
  });
});

describe("isBackendSuccess", () => {
  it("accepts boolean or string status", () => {
    expect(isBackendSuccess({ status: true })).toBe(true);
    expect(isBackendSuccess({ status: "true" })).toBe(true);
    expect(isBackendSuccess({ success: true })).toBe(true);
    expect(isBackendSuccess({})).toBe(false);
  });
});
