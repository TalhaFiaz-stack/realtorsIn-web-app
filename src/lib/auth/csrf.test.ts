import { describe, expect, it } from "vitest";
import { assertSameOrigin, CsrfError } from "@/lib/auth/csrf";

describe("assertSameOrigin", () => {
  it("allows safe methods without origin", () => {
    expect(() =>
      assertSameOrigin(new Request("http://localhost:3002/api/session"))
    ).not.toThrow();
  });

  it("rejects mutating requests without origin/referer", () => {
    expect(() =>
      assertSameOrigin(
        new Request("http://localhost:3002/api/auth/logout", { method: "POST" })
      )
    ).toThrow(CsrfError);
  });

  it("rejects cross-origin POSTs", () => {
    expect(() =>
      assertSameOrigin(
        new Request("http://localhost:3002/api/auth/logout", {
          method: "POST",
          headers: { origin: "https://evil.example" },
        })
      )
    ).toThrow(CsrfError);
  });

  it("allows matching origin", () => {
    expect(() =>
      assertSameOrigin(
        new Request("http://localhost:3002/api/auth/logout", {
          method: "POST",
          headers: {
            origin: "http://localhost:3002",
            host: "localhost:3002",
          },
        })
      )
    ).not.toThrow();
  });

  it("rejects lookalike origins that only share a prefix", () => {
    expect(() =>
      assertSameOrigin(
        new Request("https://realtorsin.com/api/auth/login/password", {
          method: "POST",
          headers: { origin: "https://realtorsin.com.evil.net", host: "realtorsin.com" },
        })
      )
    ).toThrow(CsrfError);
  });

  it("rejects plain-http origins for a non-local host", () => {
    expect(() =>
      assertSameOrigin(
        new Request("https://realtorsin.com/api/auth/logout", {
          method: "POST",
          headers: { origin: "http://realtorsin.com", host: "realtorsin.com" },
        })
      )
    ).toThrow(CsrfError);
  });

  it("allows the https origin of the request host", () => {
    expect(() =>
      assertSameOrigin(
        new Request("https://realtorsin.com/api/auth/logout", {
          method: "POST",
          headers: { origin: "https://realtorsin.com", host: "realtorsin.com" },
        })
      )
    ).not.toThrow();
  });
});
