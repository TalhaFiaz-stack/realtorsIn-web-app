import { describe, expect, it } from "vitest";
import { sanitizeOffPlanHtml } from "@/features/off-plan/lib/off-plan-html";

describe("sanitizeOffPlanHtml", () => {
  it("keeps normal description markup", () => {
    const out = sanitizeOffPlanHtml("<p>Waterfront <strong>villas</strong></p><ul><li>Pool</li></ul>");
    expect(out).toBe("<p>Waterfront <strong>villas</strong></p><ul><li>Pool</li></ul>");
  });

  it("decodes escaped HTML before sanitizing", () => {
    expect(sanitizeOffPlanHtml("&lt;p&gt;Hello&lt;/p&gt;")).toBe("<p>Hello</p>");
  });

  it("removes XSS payloads, including ones the old regex missed", () => {
    const payloads = [
      '<img src="x"/onerror="alert(1)">',
      "&lt;img src=x onerror=alert(1)&gt;",
      '<a href="javascript:alert(1)">x</a>',
      '<svg><script>alert(1)</script></svg>',
      '<iframe srcdoc="<script>alert(1)</script>"></iframe>',
      '<form action="https://evil.example"><button>go</button></form>',
      "<script>alert(1)</script>",
    ];
    for (const p of payloads) {
      const out = sanitizeOffPlanHtml(p);
      expect(out).not.toMatch(/onerror|<script|javascript:|<svg|<iframe|<form|<button/i);
    }
  });

  it("opens links safely", () => {
    const out = sanitizeOffPlanHtml('<a href="https://emaar.com">Emaar</a>');
    expect(out).toContain('rel="noopener noreferrer nofollow"');
    expect(out).toContain('target="_blank"');
  });
});
