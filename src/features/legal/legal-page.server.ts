import "server-only";

import { getEnv } from "@/lib/env";

export type LegalKind = "terms" | "privacy";

export type LegalDocument = {
  html: string | null;
  sourceUrl: string;
};

/** Strip scripts, styles, inline handlers and inline styles from backend HTML. */
export function sanitizeLegalHtml(raw: string): string {
  return raw
    .replace(/<script[\s\S]*?<\/script>/gi, "")
    .replace(/<style[\s\S]*?<\/style>/gi, "")
    .replace(/<(iframe|object|embed|form|input|button)[\s\S]*?(<\/\1>|\/?>)/gi, "")
    .replace(/\son[a-z]+\s*=\s*("[^"]*"|'[^']*'|[^\s>]+)/gi, "")
    .replace(/\sstyle\s*=\s*("[^"]*"|'[^']*')/gi, "")
    .replace(/\sclass\s*=\s*("[^"]*"|'[^']*')/gi, "")
    .replace(/href\s*=\s*("|')\s*javascript:[^"']*\1/gi, 'href="#"')
    .trim();
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
