import { beforeEach, describe, expect, it, vi } from "vitest";

const listConnections = vi.fn();

vi.mock("@/features/network/services/network.server", () => ({
  listConnections: (...args: unknown[]) => listConnections(...args),
}));

import { GET } from "@/app/api/network/list/route";
import { ApiError } from "@/lib/api/errors";

describe("GET /api/network/list", () => {
  beforeEach(() => {
    listConnections.mockReset();
  });

  it("returns mapped page when authenticated upstream succeeds", async () => {
    listConnections.mockResolvedValue({
      people: [],
      page: 1,
      perPage: 20,
      total: 0,
      totalPages: 1,
      pendingSent: 0,
      pendingReceived: 0,
      totalConnections: 0,
    });
    const res = await GET(
      new Request("http://localhost:3002/api/network/list?type=all&page=1")
    );
    expect(res.status).toBe(200);
    await expect(res.json()).resolves.toMatchObject({ ok: true, page: 1 });
  });

  it("maps session expiry to 401", async () => {
    listConnections.mockRejectedValue(
      new ApiError("SESSION_EXPIRED", "Session required", 401)
    );
    const res = await GET(
      new Request("http://localhost:3002/api/network/list")
    );
    expect(res.status).toBe(401);
    const body = await res.json();
    expect(body.code).toBe("SESSION_EXPIRED");
  });
});
