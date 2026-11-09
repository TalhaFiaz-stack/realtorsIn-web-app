/**
 * Turn user-entered links ("www.site.com", "site.com/apply", "https://…")
 * into a safe absolute http(s) URL. Returns null for values that are not a
 * link (e.g. free text), so callers can show plain text instead of a link
 * that would resolve relative to the current page.
 */
export function toExternalUrl(raw: string | null | undefined): string | null {
  const value = raw?.trim();
  if (!value || /\s/.test(value)) return null;
  const withScheme = /^[a-z][a-z0-9+.-]*:\/\//i.test(value) ? value : `https://${value}`;
  try {
    const url = new URL(withScheme);
    if (url.protocol !== "http:" && url.protocol !== "https:") return null;
    // Require a dotted host ("site.com"), so "Cupiditate" isn't treated as a domain.
    if (!url.hostname.includes(".") || url.hostname.endsWith(".")) return null;
    return url.toString();
  } catch {
    return null;
  }
}
