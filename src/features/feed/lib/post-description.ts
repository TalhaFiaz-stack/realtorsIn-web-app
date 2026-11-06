/**
 * Caption parsing for feed descriptions — mirrors mobile `mentionTextPatterns`
 * + `HighlightedDescComp` (hashtags, URLs, emails, @mentions, see more).
 */

export const MENTION_BODY =
  "@[a-zA-Z0-9_.]+(?:\\s+(?=[A-Z])[^\\s@]+)*";

export const EMAIL_BODY =
  "[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}";

const DESCRIPTION_SPLIT_REGEX = new RegExp(
  `(https?:\\/\\/[^\\s]+|${EMAIL_BODY}|#\\w+|${MENTION_BODY})`,
  "g"
);

const EMAIL_TOKEN_REGEX = new RegExp(`^${EMAIL_BODY}$`);
const MENTION_TOKEN_REGEX = new RegExp(`^${MENTION_BODY}$`);

export type DescriptionPartKind =
  | "text"
  | "hashtag"
  | "url"
  | "email"
  | "mention";

export type DescriptionPart = {
  kind: DescriptionPartKind;
  value: string;
};

export function isEmailTokenText(part: string): boolean {
  return EMAIL_TOKEN_REGEX.test(part);
}

export function isMentionTokenText(part: string): boolean {
  return MENTION_TOKEN_REGEX.test(part);
}

export function descriptionNeedsHighlight(
  description: string,
  mentionLabels: string[] = []
): boolean {
  if (!description) return false;
  if (mentionLabels.some((label) => label && description.includes(label))) {
    return true;
  }
  return (
    /https?:\/\/|#\w|@/.test(description) || EMAIL_TOKEN_REGEX.test(description)
  );
}

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

/** Highlight stored mention display names (mobile inserts names without leading @). */
function splitByMentionLabels(
  text: string,
  labels: string[]
): DescriptionPart[] {
  const unique = [...new Set(labels.filter(Boolean))].sort(
    (a, b) => b.length - a.length
  );
  if (!unique.length) return [{ kind: "text", value: text }];
  const pattern = new RegExp(
    `(${unique.map(escapeRegExp).join("|")})`,
    "g"
  );
  return text
    .split(pattern)
    .filter((part) => part != null && part !== "")
    .map((part) =>
      unique.includes(part)
        ? { kind: "mention" as const, value: part }
        : { kind: "text" as const, value: part }
    );
}

export function splitDescriptionParts(
  description: string,
  mentionLabels: string[] = []
): DescriptionPart[] {
  if (!description) return [];
  if (!descriptionNeedsHighlight(description, mentionLabels)) {
    return [{ kind: "text", value: description }];
  }

  const parts = description.split(DESCRIPTION_SPLIT_REGEX);
  const mapped = parts
    .filter((part) => part != null && part !== "")
    .flatMap((part) => {
      if (part.startsWith("#")) return [{ kind: "hashtag" as const, value: part }];
      if (part.startsWith("http://") || part.startsWith("https://")) {
        return [{ kind: "url" as const, value: part }];
      }
      if (isEmailTokenText(part)) {
        return [{ kind: "email" as const, value: part }];
      }
      if (isMentionTokenText(part)) {
        return [{ kind: "mention" as const, value: part }];
      }
      return splitByMentionLabels(part, mentionLabels);
    });

  return mapped;
}

export function displayUrl(url: string): string {
  return url.replace(/^https?:\/\//, "");
}

/** Mobile shows See More when description length > 100. */
export const DESCRIPTION_SEE_MORE_THRESHOLD = 100;

/** Collapsed line clamp matching mobile `numberOfLines={5}`. */
export const DESCRIPTION_COLLAPSED_LINES = 5;
