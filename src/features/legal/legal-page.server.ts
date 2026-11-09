import "server-only";

import { getEnv } from "@/lib/env";
import { sanitizeRichHtml } from "@/lib/security/sanitize-html";

export type LegalKind = "terms" | "privacy";

export type LegalDocument = {
  html: string | null;
  sourceUrl: string;
};

/** Strip scripts, styles, inline handlers and inline styles from backend HTML. */
export function sanitizeLegalHtml(raw: string): string {
  // Allow-list sanitizer (DOMPurify): drops scripts, styles, classes, event
  // handlers and non-http(s) links. No images on legal pages.
  return sanitizeRichHtml(raw, { allowImages: false }).trim();
}

/** Main body of the backend page: `<div class="content">` … up to the footer. */
export function extractLegalContent(page: string): string | null {
  const start = page.search(/<div class="content">/i);
  if (start === -1) return null;
  const afterStart = page.slice(start + '<div class="content">'.length);
  const end = afterStart.search(/<footer[\s>]/i);
  let body = end === -1 ? afterStart : afterStart.slice(0, end);
  // Drop the wrapper closing tags that precede the footer.
  body = body.replace(/(\s*<\/div>\s*)+$/i, "");
  // The backend page has its own Terms/Privacy switcher; the web shell provides one.
  body = body.replace(/<div class="nav-links">[\s\S]*?<\/div>/i, "");
  const clean = sanitizeLegalHtml(body);
  return clean.length > 200 ? clean : null;
}

/**
 * Official Terms / Privacy rendered by SocialProfileREM (`GET /terms`,
 * `GET /privacy` — same documents linked from `/api/login/legal-pages`).
 */
export async function fetchLegalDocument(kind: LegalKind): Promise<LegalDocument> {
  const base = getEnv().SOCIAL_API_URL.replace(/\/$/, "");
  const sourceUrl = `${base}/${kind}`;
  try {
    const res = await fetch(sourceUrl, { next: { revalidate: 86_400 } });
    if (!res.ok) return { html: null, sourceUrl };
    return { html: extractLegalContent(await res.text()), sourceUrl };
  } catch {
    return { html: null, sourceUrl };
  }
}
