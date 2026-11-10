import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));

let incoming = new Headers();
vi.mock("next/headers", () => ({ headers: async () => incoming }));

let secret: string | undefined = "a-long-shared-secret-value";
vi.mock("@/lib/env", () => ({ getEnv: () => ({ BFF_SHARED_SECRET: secret }) }));

const { getClientContextHeaders } = await import("@/lib/api/client-context.server");

describe("getClientContextHeaders", () => {
  beforeEach(() => {
    incoming = new Headers();
    secret = "a-long-shared-secret-value";
  });

  it("forwards the visitor's IP, browser and web platform with the shared key", async () => {
    incoming = new Headers({
      "x-forwarded-for": "203.0.113.7, 10.0.0.2",
      "user-agent": "Mozilla/5.0 Chrome/131",
    });
    expect(await getClientContextHeaders()).toEqual({
      "x-client-platform": "web",
      "x-bff-key": "a-long-shared-secret-value",
      "x-client-ip": "203.0.113.7",
      "x-client-user-agent": "Mozilla/5.0 Chrome/131",
    });
  });

  it("prefers the CDN / proxy real-IP headers", async () => {
    incoming = new Headers({ "cf-connecting-ip": "198.51.100.4", "x-forwarded-for": "203.0.113.7" });
    expect((await getClientContextHeaders())["x-client-ip"]).toBe("198.51.100.4");
  });

  it("ignores malformed IPs and omits the key when no secret is configured", async () => {
    secret = undefined;
    incoming = new Headers({ "x-forwarded-for": "<script>, 1.2.3.4" });
    const out = await getClientContextHeaders();
    expect(out["x-client-ip"]).toBeUndefined();
    expect(out["x-bff-key"]).toBeUndefined();
    expect(out["x-client-platform"]).toBe("web");
  });
});
