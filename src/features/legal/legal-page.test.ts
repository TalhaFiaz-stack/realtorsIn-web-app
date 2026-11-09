import { describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));
vi.mock("@/lib/env", () => ({ getEnv: () => ({ SOCIAL_API_URL: "http://api.test" }) }));

const { extractLegalContent, sanitizeLegalHtml } = await import("@/features/legal/legal-page.server");

describe("legal page extraction", () => {
  it("strips scripts, handlers and inline styles", () => {
    const out = sanitizeLegalHtml(
      '<h2 style="color:red" onclick="x()">Title</h2><script>alert(1)</script><a href="javascript:evil()">x</a>'
    );
    expect(out).toBe("<h2>Title</h2><a>x</a>");
  });

  it("blocks handler and URL tricks the old regex sanitizer missed", () => {
    const out = sanitizeLegalHtml(
      '<img src="x"/onerror="alert(1)"><svg onload="alert(1)"></svg><iframe srcdoc="<script>alert(1)</script>"></iframe><a href="JaVaScRiPt:alert(1)">y</a><p>ok</p>'
    );
    expect(out).not.toMatch(/onerror|onload|<svg|<iframe|<img|javascript:/i);
    expect(out).toContain("<p>ok</p>");
  });

  it("returns the content block before the footer", () => {
    const body = "<p>" + "Clause text. ".repeat(30) + "</p>";
    const page = `<html><body><div class="container"><div class="content"><h2>1. Terms</h2>${body}</div></div><footer>© 2026</footer></body></html>`;
    const out = extractLegalContent(page)!;
    expect(out.startsWith("<h2>1. Terms</h2>")).toBe(true);
    expect(out).not.toContain("footer");
    expect(out).not.toContain("©");
  });

  it("returns null when the page has no content block", () => {
    expect(extractLegalContent("<html><body>nothing</body></html>")).toBeNull();
  });
});
