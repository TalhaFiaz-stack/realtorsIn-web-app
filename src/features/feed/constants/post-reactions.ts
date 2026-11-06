/** Facebook-style post reactions — mirrors mobile `postReactions.js`. */

export const POST_REACTION_TYPES = [
  "like",
  "love",
  "care",
  "haha",
  "wow",
  "sad",
  "angry",
] as const;

export type PostReactionType = (typeof POST_REACTION_TYPES)[number];

export const POST_REACTION_ACCENT: Record<PostReactionType, string> = {
  like: "#1877F2",
  love: "#F02849",
  care: "#F7B928",
  haha: "#F7B928",
  wow: "#F7B928",
  sad: "#F7B928",
  angry: "#F7B928",
};

export type PostReactionOption = {
  type: PostReactionType;
  emoji: string;
  label: string;
  accentColor: string;
};

export const POST_REACTION_OPTIONS: PostReactionOption[] = [
  { type: "like", emoji: "👍", label: "Like", accentColor: POST_REACTION_ACCENT.like },
  { type: "love", emoji: "❤️", label: "Love", accentColor: POST_REACTION_ACCENT.love },
  { type: "care", emoji: "🤗", label: "Care", accentColor: POST_REACTION_ACCENT.care },
  { type: "haha", emoji: "😂", label: "Haha", accentColor: POST_REACTION_ACCENT.haha },
  { type: "wow", emoji: "😮", label: "Wow", accentColor: POST_REACTION_ACCENT.wow },
  { type: "sad", emoji: "😢", label: "Sad", accentColor: POST_REACTION_ACCENT.sad },
  { type: "angry", emoji: "😡", label: "Angry", accentColor: POST_REACTION_ACCENT.angry },
];

const byType = new Map(
  POST_REACTION_OPTIONS.map((option) => [option.type, option])
);

export function isValidPostReactionType(
  type: string | null | undefined
): type is PostReactionType {
  return typeof type === "string" && byType.has(type as PostReactionType);
}

export function normalizePostReactionType(
  type: string | null | undefined
): PostReactionType | null {
  if (type == null || String(type).trim() === "") return null;
  const normalized = String(type).trim().toLowerCase();
  return isValidPostReactionType(normalized) ? normalized : null;
}

export function getPostReactionMeta(
  reactionType: string | null | undefined
): PostReactionOption | null {
  const type = normalizePostReactionType(reactionType);
  if (!type) return null;
  return byType.get(type) ?? byType.get("like") ?? null;
}

export function normalizeReactionSummary(value: unknown): PostReactionType[] {
  if (!Array.isArray(value)) return [];
  return value
    .map((entry) => normalizePostReactionType(String(entry ?? "")))
    .filter((entry): entry is PostReactionType => entry != null);
}

export function getSummaryReactionTypes({
  reactionSummary,
  likeStatus,
  userReaction,
  likeCount,
  maxIcons = 3,
}: {
  reactionSummary: PostReactionType[];
  likeStatus: boolean;
  userReaction: PostReactionType | null;
  likeCount: number;
  maxIcons?: number;
}): PostReactionType[] {
  const count = Number(likeCount) || 0;
  const own = normalizePostReactionType(userReaction);

  const finalize = (types: PostReactionType[]) => {
    const unique: PostReactionType[] = [];
    for (const type of types) {
      if (isValidPostReactionType(type) && !unique.includes(type)) {
        unique.push(type);
      }
    }
    return unique.slice(0, maxIcons);
  };

  if (count === 1) {
    if (likeStatus && own) return finalize([own]);
    if (reactionSummary.length > 0) return finalize([reactionSummary[0]!]);
    return likeStatus ? finalize(["like"]) : [];
  }

  const types: PostReactionType[] = [];
  const pushType = (type: PostReactionType | null) => {
    if (type && !types.includes(type)) types.push(type);
  };

  reactionSummary.forEach(pushType);
  if (likeStatus && own) pushType(own);

  if (types.length === 0) {
    if (likeStatus) return finalize([own ?? "like"]);
    return [];
  }

  if (likeStatus && own && types.includes(own)) {
    return finalize([own, ...types.filter((t) => t !== own)]);
  }

  return finalize(types);
}

export function formatPostLikeSummary({
  likeCount,
  likeStatus,
  summaryReactionTypes = [],
}: {
  likeCount: number;
  likeStatus: boolean;
  summaryReactionTypes?: PostReactionType[];
}): string | null {
  const count = Number(likeCount) || 0;
  if (count <= 0) return null;

  const types = summaryReactionTypes.filter(isValidPostReactionType);
  const useLikeLabel =
    types.length === 0 || (types.length === 1 && types[0] === "like");
  const singularLabel = useLikeLabel ? "Like" : "Reaction";
  const pluralLabel = useLikeLabel ? "Likes" : "Reactions";

  if (likeStatus) {
    if (count === 1) return "You";
    const others = count - 1;
    return `You and ${others} ${others === 1 ? "other" : "others"}`;
  }

  if (count === 1) return `1 ${singularLabel}`;
  return `${count} ${pluralLabel}`;
}

/** Optimistic like/reaction state — mirrors mobile `computeReactionOptimisticState`. */
export function computeReactionOptimisticState({
  currentReaction,
  currentLikeStatus,
  currentLikeCount,
  nextReactionType,
  isTapToggle,
}: {
  currentReaction: PostReactionType | null;
  currentLikeStatus: boolean;
  currentLikeCount: number;
  nextReactionType?: PostReactionType | null;
  isTapToggle: boolean;
}): {
  isLiked: boolean;
  userReaction: PostReactionType | null;
  likeCount: number;
} {
  const count = Number(currentLikeCount) || 0;
  const normalizedReaction = normalizePostReactionType(currentReaction);
  const hadReaction = currentLikeStatus || !!normalizedReaction;

  if (isTapToggle) {
    if (hadReaction) {
      return {
        isLiked: false,
        userReaction: null,
        likeCount: Math.max(0, count - 1),
      };
    }
    return {
      isLiked: true,
      userReaction: "like",
      likeCount: count + 1,
    };
  }

  if (!nextReactionType || !isValidPostReactionType(nextReactionType)) {
    return {
      isLiked: currentLikeStatus,
      userReaction: normalizedReaction,
      likeCount: count,
    };
  }

  if (hadReaction && normalizedReaction === nextReactionType) {
    return {
      isLiked: false,
      userReaction: null,
      likeCount: Math.max(0, count - 1),
    };
  }

  if (hadReaction) {
    return {
      isLiked: true,
      userReaction: nextReactionType,
      likeCount: count,
    };
  }

  return {
    isLiked: true,
    userReaction: nextReactionType,
    likeCount: count + 1,
  };
}

export function buildReactionSummaryPatch({
  isLiked,
  userReaction,
  likeCount,
  previousSummary,
  previousUserReaction,
}: {
  isLiked: boolean;
  userReaction: PostReactionType | null;
  likeCount: number;
  previousSummary: PostReactionType[];
  previousUserReaction: PostReactionType | null;
}): PostReactionType[] {
  if (!isLiked) {
    if (likeCount <= 0) return [];
    const prevOwn = normalizePostReactionType(previousUserReaction);
    if (prevOwn) {
      return previousSummary.filter((entry) => entry !== prevOwn).slice(0, 3);
    }
    return previousSummary.slice(0, 3);
  }

  const type = normalizePostReactionType(userReaction) ?? "like";
  if (likeCount <= 1) return [type];

  const prevOwn = normalizePostReactionType(previousUserReaction);
  let withoutOwn = previousSummary;
  if (prevOwn && prevOwn !== type) {
    withoutOwn = previousSummary.filter((entry) => entry !== prevOwn);
  }

  if (withoutOwn.length === 0) return [type];
  return [type, ...withoutOwn.filter((entry) => entry !== type)].slice(0, 3);
}
