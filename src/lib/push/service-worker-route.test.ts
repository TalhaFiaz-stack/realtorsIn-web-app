import { afterEach, describe, expect, it, vi } from "vitest";

const ENV = {
  NEXT_PUBLIC_FIREBASE_API_KEY: "test-key",
  NEXT_PUBLIC_FIREBASE_PROJECT_ID: "realtorsin-test",
  NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID: "123",
  NEXT_PUBLIC_FIREBASE_APP_ID: "1:123:web:abc",
};

describe("firebase-messaging-sw.js route", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
    vi.resetModules();
  });

  it("serves a stub when push is not configured", async () => {
    const { GET } = await import("@/app/firebase-messaging-sw.js/route");
    const body = await GET().text();
    expect(body).toContain("not configured");
    expect(() => new Function(body)).not.toThrow();
  });

  it("serves a parseable worker with config and click routing", async () => {
    for (const [k, v] of Object.entries(ENV)) vi.stubEnv(k, v);
    const { GET } = await import("@/app/firebase-messaging-sw.js/route");
    const res = GET();
    expect(res.headers.get("Content-Type")).toContain("javascript");
    const body = await res.text();
    expect(body).toContain('"projectId":"realtorsin-test"');
    expect(body).toContain("notificationclick");
    expect(body).toContain("push-read");
    // Parses (does not execute) — catches syntax errors in the generated file.
    expect(() => new Function(body)).not.toThrow();
  });
});
