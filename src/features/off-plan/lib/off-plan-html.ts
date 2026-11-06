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

/** Strip scripts/event handlers before rendering trusted REM HTML. */
export function sanitizeOffPlanHtml(html: string): string {
  let safe = decodeOffPlanHtmlEntities(html);
  safe = safe.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "");
  safe = safe.replace(/\son\w+\s*=\s*("[^"]*"|'[^']*'|[^\s>]+)/gi, "");
  return safe;
}
