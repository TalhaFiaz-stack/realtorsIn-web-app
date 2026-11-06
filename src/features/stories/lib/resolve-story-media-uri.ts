/**
 * Resolve story media paths to browser-loadable URLs (mobile `resolveStoryMediaUri` parity).
 */
export function resolveStoryMediaUri(uri: unknown): string | null {
  if (uri == null || uri === "") return null;

  if (typeof uri === "object" && !Array.isArray(uri)) {
    const record = uri as Record<string, unknown>;
    const nested =
      record.url ?? record.uri ?? record.path ?? record.image ?? null;
    return resolveStoryMediaUri(nested);
  }

  if (typeof uri !== "string") return null;

  const trimmed = uri.trim();
  if (!trimmed) return null;

  const isAbsolute =
    trimmed.startsWith("http://") ||
    trimmed.startsWith("https://") ||
    trimmed.startsWith("data:") ||
    trimmed.startsWith("blob:");

  if (isAbsolute) return trimmed;

  const clean = trimmed.replace(/^\//, "");
  const base = String(
    process.env.NEXT_PUBLIC_SOCIAL_FILES_BASE_URL ?? ""
  ).replace(/\/$/, "");
  if (!base) return trimmed;

  return `${base}/${clean}`;
}

function looksLikeVideoAsset(url: string): boolean {
  return /\.(mp4|webm|mov|m4v|m3u8)(\?|$)/i.test(url);
}

/** Pick a still image URL for chat/feed story previews (never prefer raw video). */
export function getStoryPreviewImageUri(story: Record<string, unknown> | null): string | null {
  if (!story) return null;

  const mediaType = String(story.media_type ?? story.mediaType ?? "")
    .trim()
    .toLowerCase();
  const isVideo = mediaType === "video";

  const preview = resolveStoryMediaUri(story.preview_url ?? story.previewUrl);
  const thumb = resolveStoryMediaUri(story.thumbnail_url ?? story.thumbnailUrl);
  const media = resolveStoryMediaUri(story.media_url ?? story.mediaUrl);

  const candidates = isVideo
    ? [preview, thumb]
    : [preview, thumb, media];

  for (const candidate of candidates) {
    if (!candidate) continue;
    if (isVideo && looksLikeVideoAsset(candidate)) continue;
    if (!isVideo && looksLikeVideoAsset(candidate)) continue;
    return candidate;
  }

  if (!isVideo && media && !looksLikeVideoAsset(media)) {
    return media;
  }

  return null;
}
