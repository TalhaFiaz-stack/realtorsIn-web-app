/**
 * Turn a SocialProfileREM media path into a URL the browser can load.
 *
 * The backend sometimes returns bare paths ("realtorsin/jobs/29/images0.png")
 * that only exist on its own host, and sometimes absolute URLs with a missing
 * slash (".comrealtorsin/…" — mobile patches the same bug). Relative paths are
 * resolved against NEXT_PUBLIC_SOCIAL_FILES_BASE_URL (defaults to
 * SOCIAL_API_URL; set it to the public / tunnel host when they differ).
 */
export function resolveMediaUrl(value: unknown): string | null {
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  if (!trimmed) return null;

  if (/^(https?:|data:|blob:)/i.test(trimmed)) {
    return trimmed.replace(/\.com(realtorsin\/)/i, ".com/$1");
  }
  if (trimmed.startsWith("//")) return `https:${trimmed}`;

  const base = String(process.env.NEXT_PUBLIC_SOCIAL_FILES_BASE_URL ?? "").replace(/\/+$/, "");
  const path = trimmed.replace(/^\/+/, "");
  return base ? `${base}/${path}` : `/${path}`;
}
