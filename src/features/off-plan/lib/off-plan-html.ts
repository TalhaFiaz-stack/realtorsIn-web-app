import { sanitizeRichHtml } from "@/lib/security/sanitize-html";

const ENTITY_MAP: Record<string, string> = {
  "&amp;": "&",
  "&nbsp;": " ",
  "&lt;": "<",
  "&gt;": ">",
  "&quot;": '"',
  "&#39;": "'",
  "&apos;": "'",
};

export function decodeOffPlanHtmlEntities(html: string): string {
  return html.replace(
    /&(?:amp|nbsp|lt|gt|quot|#39|apos);/g,
    (match) => ENTITY_MAP[match] ?? match
  );
}

/**
 * Sanitize REM rich-text descriptions before rendering. Upstream often sends
 * the HTML entity-escaped, so decode first, then run the allow-list
 * sanitizer (DOMPurify) on the real markup.
 */
export function sanitizeOffPlanHtml(html: string): string {
  return sanitizeRichHtml(decodeOffPlanHtmlEntities(html));
}
