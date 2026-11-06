import type { FeedPost } from "@/features/feed/types/post.types";

const GENERIC_PROJECT_LABELS = new Set([
  "project share",
  "off-plan project",
  "off plan project",
]);

const GENERIC_PROPERTY_LABELS = new Set([
  "property listing",
  "property share",
  "shared property",
]);

/** Hide boilerplate share captions when a rich embed is shown (mobile parity). */
export function shouldShowActivityPostDescription(post: FeedPost): boolean {
  const text = post.description.trim();
  if (!text) return false;
  const normalized = text.toLowerCase();
  if (post.isProjectShare && GENERIC_PROJECT_LABELS.has(normalized)) {
    return false;
  }
  if (post.isPropertyShare && GENERIC_PROPERTY_LABELS.has(normalized)) {
    return false;
  }
  return true;
}

export function activityPostHasVisualEmbed(post: FeedPost): boolean {
  if (post.isProjectShare || post.isPropertyShare) return true;
  if (post.images.length > 0) return true;
  return false;
}
