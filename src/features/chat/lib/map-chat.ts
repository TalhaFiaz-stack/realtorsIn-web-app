import { previewFromLastMessageRaw } from "@/features/chat/lib/message-list-preview";
import { getStoryPreviewImageUri } from "@/features/stories/lib/resolve-story-media-uri";
import type {
  BlockedChatUser,
  ChatMessage,
  ChatMessageReaction,
  ChatSharedEvent,
  ChatSharedJob,
  ChatSharedPost,
  ChatSharedProfile,
  ChatSharedStory,
  ChatUser,
  ConversationSummary,
  ConversationsPage,
  MessagesPage,
} from "@/features/chat/types/chat.types";

function asRecord(value: unknown): Record<string, unknown> | null {
  return value && typeof value === "object" && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : null;
}

function parseEmbeddedJson(value: unknown): Record<string, unknown> | null {
  if (typeof value === "string" && value.trim()) {
    try {
      return asRecord(JSON.parse(value));
    } catch {
      return null;
    }
  }
  return asRecord(value);
}

function asString(value: unknown): string | null {
  if (typeof value === "string" && value.trim()) return value.trim();
  if (typeof value === "number" && Number.isFinite(value)) return String(value);
  return null;
}

function asNumber(value: unknown, fallback: number | null = null): number | null {
  const n = typeof value === "number" ? value : Number(value);
  return Number.isFinite(n) ? n : fallback;
}

function asBool(value: unknown): boolean {
  return value === true || value === "true" || value === 1 || value === "1";
}

export function isBackendSuccess(payload: unknown): boolean {
  const p = asRecord(payload);
  if (!p) return false;
  return (
    p.status === true ||
    p.status === "true" ||
    p.success === true ||
    p.success === "true"
  );
}

export function backendMessage(payload: unknown, fallback: string): string {
  return asString(asRecord(payload)?.message) ?? fallback;
}

export function mapChatUser(raw: unknown): ChatUser | null {
  const row = asRecord(raw);
  if (!row) return null;
  const id = asNumber(row.id);
  if (id == null) return null;
  const first = asString(row.first_name) ?? "";
  const last = asString(row.last_name) ?? "";
  const name =
    `${first} ${last}`.trim() ||
    asString(row.name) ||
    asString(row.user_name) ||
    "Member";
  return {
    id,
    name,
    userName: asString(row.user_name),
    avatarUrl: asString(row.profile_pic) ?? asString(row.profile_image),
    isOnline: asBool(row.is_online),
  };
}

export function mapConversation(raw: unknown): ConversationSummary | null {
  const row = asRecord(raw);
  if (!row) return null;
  const id = asNumber(row.conversation_id);
  const other = mapChatUser(row.other_user);
  if (id == null || !other) return null;
  const lastText = previewFromLastMessageRaw(row.last_message);
  return {
    id,
    otherUser: other,
    lastMessage: lastText,
    lastMessageAt: asString(row.last_message_at),
    unreadCount: asNumber(row.unread_count, 0) ?? 0,
    isPinned: asBool(row.is_pinned),
    isMuted: asBool(row.is_muted),
    isArchived: asBool(row.is_archived),
  };
}

export function mapConversationsPage(payload: unknown): ConversationsPage {
  const root = asRecord(payload);
  const data = asRecord(root?.data);
  const list = Array.isArray(data?.conversations) ? data.conversations : [];
  const pagination = asRecord(data?.pagination);
  return {
    conversations: list
      .map(mapConversation)
      .filter((c): c is ConversationSummary => Boolean(c)),
    page: asNumber(pagination?.page, 1) ?? 1,
    limit: asNumber(pagination?.limit, 20) ?? 20,
    total: asNumber(pagination?.total, 0) ?? 0,
    hasMore: asBool(pagination?.has_more),
  };
}

function mapMessageImages(row: Record<string, unknown>): ChatMessage["images"] {
  const list = Array.isArray(row.images) ? row.images : [];
  const mapped = list
    .map((item) => {
      const img = asRecord(item);
      const url =
        asString(img?.image_url) ??
        asString(img?.url) ??
        asString(img?.image);
      if (!url) return null;
      return {
        url,
        thumbnailUrl: asString(img?.thumbnail_url),
      };
    })
    .filter((item): item is NonNullable<typeof item> => Boolean(item));

  const primary = asString(row.image_url);
  if (primary && !mapped.some((item) => item.url === primary)) {
    mapped.unshift({ url: primary, thumbnailUrl: null });
  }
  return mapped;
}

function mapSharedPost(raw: unknown): ChatSharedPost | null {
  const row = asRecord(raw);
  if (!row) return null;
  const id = asNumber(row.id);
  if (id == null) return null;
  const images = Array.isArray(row.images) ? row.images : [];
  const firstImage = asRecord(images[0]);
  const property = parseEmbeddedJson(row.property_data);
  const project = parseEmbeddedJson(row.project_data);
  const isProjectShare = asBool(row.is_project_share) || Boolean(project);
  const projectBanner =
    asString(project?.banner_image) ?? asString(project?.image);
  return {
    id,
    authorName: asString(row.name),
    userName: asString(row.user_name),
    avatarUrl: asString(row.user_image),
    description: asString(row.description),
    imageUrl: isProjectShare
      ? (projectBanner ??
        asString(firstImage?.image_url) ??
        asString(firstImage?.url) ??
        asString(firstImage?.image))
      : (asString(firstImage?.image_url) ??
        asString(firstImage?.url) ??
        asString(firstImage?.image)),
    isPropertyShare: asBool(row.is_property_share),
    isProjectShare,
    propertyTitle: asString(property?.title),
    propertyLocation:
      asString(property?.location) ??
      asString(property?.community) ??
      asString(property?.city),
    projectTitle:
      asString(project?.name) ??
      asString(project?.title) ??
      asString(project?.project_name),
    projectData: project,
  };
}

function mapSharedJob(raw: unknown): ChatSharedJob | null {
  const row = asRecord(raw);
  if (!row) return null;
  const id = asNumber(row.id);
  if (id == null) return null;
  const poster = asRecord(row.poster);
  return {
    id,
    title: asString(row.title),
    company:
      asString(row.company) ??
      asString(poster?.company) ??
      asString(poster?.name),
    location: asString(row.location),
    employmentType: asString(row.employment_type),
    jobType: asString(row.job_type),
  };
}

function mapSharedEvent(raw: unknown): ChatSharedEvent | null {
  const row = asRecord(raw);
  if (!row) return null;
  const id = asNumber(row.id);
  if (id == null) return null;
  return {
    id,
    title: asString(row.title) ?? asString(row.name),
    category: asString(row.category),
    coverUrl:
      asString(row.cover_image) ??
      asString(row.cover_url) ??
      asString(row.image_url),
    location:
      asString(row.location) ??
      asString(row.venue) ??
      asString(row.city),
    startsAt:
      asString(row.start_date) ??
      asString(row.starts_at) ??
      asString(row.event_date),
  };
}

function mapSharedProfile(raw: unknown): ChatSharedProfile | null {
  const row = asRecord(raw);
  if (!row) return null;
  const id = asNumber(row.id);
  if (id == null) return null;
  const first = asString(row.name) ?? asString(row.first_name) ?? "";
  const last = asString(row.last_name) ?? "";
  const profileImage = row.profile_image;
  const avatarUrl =
    asString(profileImage) ??
    asString(asRecord(profileImage)?.url) ??
    asString(row.user_image);
  return {
    id,
    name: `${first} ${last}`.trim() || asString(row.user_name),
    userName: asString(row.user_name),
    avatarUrl,
    role: asString(row.user_role) ?? asString(row.role),
    company: asString(row.company),
  };
}

function mapSharedStory(raw: unknown): ChatSharedStory | null {
  const row = parseEmbeddedJson(raw);
  if (!row) return null;
  const id = asNumber(row.id);
  if (id == null) return null;
  const owner = asRecord(row.owner);
  const ownerFirst = asString(owner?.name) ?? "";
  const ownerLast = asString(owner?.last_name) ?? "";
  const ownerFull = `${ownerFirst} ${ownerLast}`.trim();
  const mediaType =
    asString(row.media_type) ?? asString(row.mediaType) ?? "image";
  return {
    id,
    ownerName:
      asString(row.owner_name) ??
      (ownerFull || null) ??
      asString(owner?.user_name),
    previewUrl: getStoryPreviewImageUri(row),
    mediaType,
    isExpired: asBool(row.is_expired ?? row.isExpired),
  };
}

export type MapMessageOptions = {
  /**
   * Trusted current-user acknowledgement only (e.g. SSE `message_sent`).
   * Never use this to guess ownership from other_user inequality.
   */
  forceOwn?: boolean;
};

/**
 * Ownership rules:
 * 1. forceOwn → own
 * 2. valid currentUserId → senderId === currentUserId
 * 3. otherwise → not own (never infer from other_user)
 */
export function resolveIsOwn(input: {
  senderId: number;
  currentUserId: number | null;
  forceOwn?: boolean;
}): boolean {
  if (input.forceOwn === true) return true;
  if (input.forceOwn === false) return false;
  if (input.currentUserId == null) return false;
  return input.senderId === input.currentUserId;
}

export function mapMessageReactions(raw: unknown): ChatMessageReaction[] {
  if (!Array.isArray(raw)) return [];
  const byEmoji = new Map<string, number[]>();
  for (const item of raw) {
    const row = asRecord(item);
    const emoji = asString(row?.emoji);
    const userId = asNumber(row?.fk_user_id ?? row?.user_id);
    if (!emoji) continue;
    const users = byEmoji.get(emoji) ?? [];
    if (userId != null) users.push(userId);
    byEmoji.set(emoji, users);
  }
  return Array.from(byEmoji, ([emoji, userIds]) => ({
    emoji,
    count: userIds.length || 1,
    userIds,
  }));
}

export function mapMessage(
  raw: unknown,
  currentUserId: number | null,
  options?: MapMessageOptions
): ChatMessage | null {
  const row = asRecord(raw);
  if (!row) return null;
  const id = asNumber(row.id);
  const conversationId = asNumber(row.fk_conversation_id ?? row.conversation_id);
  const senderId = asNumber(row.fk_sender_id ?? row.sender_id);
  const receiverId = asNumber(row.fk_receiver_id ?? row.receiver_id);
  if (id == null || conversationId == null || senderId == null) return null;
  const images = mapMessageImages(row);
  return {
    id,
    conversationId,
    senderId,
    receiverId: receiverId ?? 0,
    content: asString(row.message_content) ?? "",
    messageType: asString(row.message_type) ?? "text",
    createdAt: asString(row.created_at),
    isRead: asBool(row.is_read),
    isDelivered: asBool(row.is_delivered),
    isOwn: resolveIsOwn({
      senderId,
      currentUserId,
      forceOwn: options?.forceOwn,
    }),
    imageUrl: asString(row.image_url) ?? images[0]?.url ?? null,
    images,
    documentUrl: asString(row.document_url),
    documentName: asString(row.document_name),
    documentSize: asNumber(row.document_size),
    sharedPost: mapSharedPost(row.sharedPost ?? row.shared_post),
    sharedJob: mapSharedJob(row.sharedJob ?? row.shared_job),
    sharedEvent: mapSharedEvent(row.sharedEvent ?? row.shared_event),
    sharedProfile: mapSharedProfile(row.sharedProfile ?? row.shared_profile),
    sharedStory: mapSharedStory(row.sharedStory ?? row.shared_story),
    isEdited: asBool(row.is_edited),
    isDeleted: asBool(row.deleted_for_everyone),
    reactions: mapMessageReactions(row.reactions),
  };
}

export function mapMessagesPage(
  payload: unknown,
  currentUserId: number | null
): MessagesPage {
  const root = asRecord(payload);
  const data = asRecord(root?.data);
  const list = Array.isArray(data?.messages) ? data.messages : [];
  const pagination = asRecord(data?.pagination);
  const otherUser = mapChatUser(data?.other_user);

  return {
    messages: list
      .map((m) => mapMessage(m, currentUserId))
      .filter((m): m is ChatMessage => Boolean(m)),
    otherUser,
    page: asNumber(pagination?.page, 1) ?? 1,
    limit: asNumber(pagination?.limit, 50) ?? 50,
    total: asNumber(pagination?.total, 0) ?? 0,
    hasMore: asBool(pagination?.has_more),
  };
}

export function mapBlockedUsers(payload: unknown): BlockedChatUser[] {
  const data = asRecord(asRecord(payload)?.data);
  const list = Array.isArray(data?.blocked_users) ? data.blocked_users : [];
  return list
    .map((raw): BlockedChatUser | null => {
      const row = asRecord(raw);
      const userId = asNumber(row?.user_id ?? row?.id);
      if (!row || userId == null) return null;
      const name =
        `${asString(row.first_name) ?? ""} ${asString(row.last_name) ?? ""}`.trim() ||
        asString(row.name) ||
        "Member";
      return {
        userId,
        name,
        avatarUrl: asString(row.profile_image) ?? asString(row.profile_pic),
        blockedAt: asString(row.blocked_at) ?? asString(row.created_at),
      };
    })
    .filter((u): u is BlockedChatUser => u != null);
}
