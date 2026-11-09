import "server-only";

import { socialApiRequest } from "@/lib/api/server-client";
import { getSessionToken } from "@/lib/auth/session";
import { ApiError } from "@/lib/api/errors";
import {
  emitTypingViaSocket,
  joinConversationViaSocket,
  leaveConversationViaSocket,
} from "@/lib/socket/server-chat";
import { mapMessage } from "@/features/chat/lib/map-chat";
import type { ChatMessage } from "@/features/chat/types/chat.types";
import {
  backendMessage,
  isBackendSuccess,
  mapBlockedUsers,
  mapConversationsPage,
  mapMessagesPage,
} from "@/features/chat/lib/map-chat";
import type {
  BlockedChatUser,
  ConversationsPage,
  MessagesPage,
} from "@/features/chat/types/chat.types";

export async function listConversations(input: {
  page: number;
  limit?: number;
  search?: string;
}): Promise<ConversationsPage> {
  const payload = await socialApiRequest<unknown>({
    path: "/api/social/chat/conversations",
    method: "GET",
    auth: true,
    params: {
      page: input.page,
      limit: input.limit ?? 20,
      ...(input.search ? { search: input.search } : {}),
    },
  });
  if (!isBackendSuccess(payload)) {
    throw new ApiError(
      "SERVER",
      backendMessage(payload, "Unable to load conversations"),
      502
    );
  }
  return mapConversationsPage(payload);
}

export async function pinConversation(input: {
  conversationId: number;
  isPinned: boolean;
}): Promise<void> {
  const payload = await socialApiRequest<unknown>({
    path: `/api/social/chat/conversations/${input.conversationId}/pin`,
    method: "POST",
    auth: true,
    data: { is_pinned: input.isPinned },
  });
  if (!isBackendSuccess(payload)) {
    throw new ApiError(
      "SERVER",
      backendMessage(payload, "Unable to update pin"),
      502
    );
  }
}

export async function muteConversation(input: {
  conversationId: number;
  isMuted: boolean;
}): Promise<void> {
  const payload = await socialApiRequest<unknown>({
    path: `/api/social/chat/conversations/${input.conversationId}/mute`,
    method: "POST",
    auth: true,
    data: { is_muted: input.isMuted },
  });
  if (!isBackendSuccess(payload)) {
    throw new ApiError(
      "SERVER",
      backendMessage(payload, "Unable to update mute"),
      502
    );
  }
}

export async function archiveConversation(input: {
  conversationId: number;
  isArchived: boolean;
}): Promise<void> {
  const payload = await socialApiRequest<unknown>({
    path: `/api/social/chat/conversations/${input.conversationId}/archive`,
    method: "POST",
    auth: true,
    data: { is_archived: input.isArchived },
  });
  if (!isBackendSuccess(payload)) {
    throw new ApiError(
      "SERVER",
      backendMessage(payload, "Unable to archive conversation"),
      502
    );
  }
}

export async function deleteConversation(
  conversationId: number
): Promise<void> {
  const payload = await socialApiRequest<unknown>({
    path: `/api/social/chat/conversations/${conversationId}/delete`,
    method: "POST",
    auth: true,
  });
  if (!isBackendSuccess(payload)) {
    throw new ApiError(
      "SERVER",
      backendMessage(payload, "Unable to delete conversation"),
      502
    );
  }
}

export async function startConversation(receiverId: number): Promise<{
  conversationId: number;
}> {
  const payload = await socialApiRequest<{
    status?: boolean | string;
    message?: string;
    data?: { conversation_id?: number | string };
  }>({
    path: "/api/social/chat/conversations/start",
    method: "POST",
    auth: true,
    data: { receiver_id: receiverId },
  });
  if (!isBackendSuccess(payload)) {
    throw new ApiError(
      "SERVER",
      backendMessage(payload, "Unable to start conversation"),
      502
    );
  }
  const id = Number(payload.data?.conversation_id);
  if (!Number.isFinite(id)) {
    throw new ApiError("SERVER", "Missing conversation id", 502);
  }
  return { conversationId: id };
}

export async function listMessages(input: {
  conversationId: number;
  page?: number;
  limit?: number;
  beforeMessageId?: number;
  currentUserId?: number | null;
}): Promise<MessagesPage> {
  const payload = await socialApiRequest<unknown>({
    path: `/api/social/chat/conversations/${input.conversationId}/messages`,
    method: "GET",
    auth: true,
    params: {
      page: input.page ?? 1,
      limit: input.limit ?? 50,
      ...(input.beforeMessageId
        ? { before_message_id: input.beforeMessageId }
        : {}),
    },
  });
  if (!isBackendSuccess(payload)) {
    throw new ApiError(
      "SERVER",
      backendMessage(payload, "Unable to load messages"),
      502
    );
  }
  return mapMessagesPage(payload, input.currentUserId ?? null);
}

export async function markMessagesRead(input: {
  conversationId: number;
  messageIds?: number[];
}): Promise<void> {
  const payload = await socialApiRequest<unknown>({
    path: "/api/social/chat/messages/read",
    method: "POST",
    auth: true,
    data: {
      conversation_id: input.conversationId,
      ...(input.messageIds?.length
        ? { message_ids: input.messageIds }
        : {}),
    },
  });
  if (!isBackendSuccess(payload)) {
    throw new ApiError(
      "SERVER",
      backendMessage(payload, "Unable to mark read"),
      502
    );
  }
}

export async function getChatUnreadCount(): Promise<{
  totalUnread: number;
  conversationsWithUnread: number;
}> {
  const payload = await socialApiRequest<{
    status?: boolean | string;
    data?: {
      total_unread?: number;
      conversations_with_unread?: number;
    };
  }>({
    path: "/api/social/chat/unread-count",
    method: "GET",
    auth: true,
  });
  if (!isBackendSuccess(payload)) {
    throw new ApiError(
      "SERVER",
      backendMessage(payload, "Unable to load unread count"),
      502
    );
  }
  return {
    totalUnread: Number(payload.data?.total_unread ?? 0),
    conversationsWithUnread: Number(
      payload.data?.conversations_with_unread ?? 0
    ),
  };
}

export async function sendStoryReply(input: {
  receiverId: number;
  storyId: number;
  messageContent: string;
}): Promise<void> {
  const payload = await socialApiRequest<{
    status?: boolean | string;
    message?: string;
    data?: { id?: number };
  }>({
    path: "/api/social/chat/messages/share-story-reply",
    method: "POST",
    auth: true,
    data: {
      receiver_id: input.receiverId,
      story_id: input.storyId,
      message_content: input.messageContent,
    },
  });
  if (!isBackendSuccess(payload)) {
    throw new ApiError(
      "SERVER",
      backendMessage(payload, "Unable to send story reply"),
      502
    );
  }
}

async function sendChatMessageViaHttp(input: {
  receiverId: number;
  messageContent: string;
}): Promise<{ id: number; content: string; createdAt: string | null }> {
  const payload = await socialApiRequest<{
    status?: boolean | string;
    message?: string;
    data?: Record<string, unknown>;
  }>({
    path: "/api/social/chat/messages/send",
    method: "POST",
    auth: true,
    data: {
      receiver_id: input.receiverId,
      message_content: input.messageContent,
    },
  });
  if (!isBackendSuccess(payload) || !payload.data) {
    throw new ApiError(
      "SERVER",
      backendMessage(payload, "Unable to send message"),
      502
    );
  }
  const id = Number(payload.data.id);
  if (!Number.isFinite(id)) {
    throw new ApiError("SERVER", "Unable to send message", 502);
  }
  return {
    id,
    content: String(
      payload.data.message_content ?? input.messageContent
    ),
    createdAt:
      typeof payload.data.created_at === "string"
        ? payload.data.created_at
        : null,
  };
}

export async function sendChatMessage(input: {
  receiverId: number;
  messageContent: string;
}): Promise<{ id: number; content: string; createdAt: string | null }> {
  const token = await getSessionToken();
  if (!token) {
    throw new ApiError("SESSION_EXPIRED", "Session required", 401);
  }
  return sendChatMessageViaHttp(input);
}

export async function uploadChatFile(file: File): Promise<{
  fileUrl: string;
  fileName: string;
  fileSize: number;
  fileType: string;
}> {
  const form = new FormData();
  form.append("file", file, file.name);
  const payload = await socialApiRequest<{
    status?: boolean | string;
    message?: string;
    data?: {
      file_url?: string;
      file_name?: string;
      file_size?: number;
      file_type?: string;
    };
  }>({
    path: "/api/social/chat/upload/file",
    method: "POST",
    auth: true,
    isFormData: true,
    data: form,
  });
  if (!isBackendSuccess(payload) || !payload.data?.file_url) {
    throw new ApiError(
      "SERVER",
      backendMessage(payload, "Unable to upload file"),
      502
    );
  }
  return {
    fileUrl: String(payload.data.file_url),
    fileName: String(payload.data.file_name ?? file.name),
    fileSize: Number(payload.data.file_size ?? file.size),
    fileType: String(payload.data.file_type ?? file.type),
  };
}

function mapSocketMessage(
  raw: unknown,
  currentUserId: number | null
): ChatMessage {
  const mapped = mapMessage(raw, currentUserId);
  if (!mapped) {
    throw new ApiError("SERVER", "Invalid chat message response", 502);
  }
  return mapped;
}

async function sendChatImageViaHttp(input: {
  receiverId: number;
  imageUrls: string[];
  messageContent?: string;
  currentUserId?: number | null;
}): Promise<ChatMessage> {
  const payload = await socialApiRequest<{
    status?: boolean | string;
    message?: string;
    data?: unknown;
  }>({
    path: "/api/social/chat/messages/send-image",
    method: "POST",
    auth: true,
    data: {
      receiver_id: input.receiverId,
      images: input.imageUrls.map((image_url, order) => ({
        image_url,
        order,
      })),
      message_content: input.messageContent ?? "",
    },
  });
  if (!isBackendSuccess(payload) || payload.data == null) {
    throw new ApiError(
      "SERVER",
      backendMessage(payload, "Unable to send image"),
      502
    );
  }
  return mapSocketMessage(payload.data, input.currentUserId ?? null);
}

async function sendChatDocumentViaHttp(input: {
  receiverId: number;
  documentUrl: string;
  documentName: string;
  documentSize: number;
  messageContent?: string;
  currentUserId?: number | null;
}): Promise<ChatMessage> {
  const payload = await socialApiRequest<{
    status?: boolean | string;
    message?: string;
    data?: unknown;
  }>({
    path: "/api/social/chat/messages/send-document",
    method: "POST",
    auth: true,
    data: {
      receiver_id: input.receiverId,
      document_url: input.documentUrl,
      document_name: input.documentName,
      document_size: input.documentSize,
      message_content: input.messageContent ?? "",
    },
  });
  if (!isBackendSuccess(payload) || payload.data == null) {
    throw new ApiError(
      "SERVER",
      backendMessage(payload, "Unable to send document"),
      502
    );
  }
  return mapSocketMessage(payload.data, input.currentUserId ?? null);
}

export async function sendChatImage(input: {
  receiverId: number;
  imageUrls: string[];
  messageContent?: string;
  currentUserId?: number | null;
}): Promise<ChatMessage> {
  const token = await getSessionToken();
  if (!token) {
    throw new ApiError("SESSION_EXPIRED", "Session required", 401);
  }
  return sendChatImageViaHttp(input);
}

export async function sendChatDocument(input: {
  receiverId: number;
  documentUrl: string;
  documentName: string;
  documentSize: number;
  messageContent?: string;
  currentUserId?: number | null;
}): Promise<ChatMessage> {
  const token = await getSessionToken();
  if (!token) {
    throw new ApiError("SESSION_EXPIRED", "Session required", 401);
  }
  return sendChatDocumentViaHttp(input);
}

export async function sendChatPostShare(input: {
  receiverId: number;
  postId: number;
  messageContent?: string;
  currentUserId?: number | null;
}): Promise<ChatMessage> {
  const payload = await socialApiRequest<{
    status?: boolean | string;
    message?: string;
    data?: unknown;
  }>({
    path: "/api/social/chat/messages/share-post",
    method: "POST",
    auth: true,
    data: {
      receiver_id: input.receiverId,
      post_id: input.postId,
      message_content: input.messageContent?.trim() ?? "",
    },
  });
  if (!isBackendSuccess(payload) || payload.data == null) {
    throw new ApiError(
      "SERVER",
      backendMessage(payload, "Unable to share post"),
      502
    );
  }
  return mapSocketMessage(payload.data, input.currentUserId ?? null);
}

export async function sendChatJobShare(input: {
  receiverId: number;
  jobId: number;
  messageContent?: string;
  currentUserId?: number | null;
}): Promise<ChatMessage> {
  const payload = await socialApiRequest<{
    status?: boolean | string;
    message?: string;
    data?: unknown;
  }>({
    path: "/api/social/chat/messages/share-job",
    method: "POST",
    auth: true,
    data: {
      receiver_id: input.receiverId,
      job_id: input.jobId,
      message_content: input.messageContent?.trim() ?? "",
    },
  });
  if (!isBackendSuccess(payload) || payload.data == null) {
    throw new ApiError(
      "SERVER",
      backendMessage(payload, "Unable to share job"),
      502
    );
  }
  return mapSocketMessage(payload.data, input.currentUserId ?? null);
}

export async function sendChatEventShare(input: {
  receiverId: number;
  eventId: number;
  messageContent?: string;
  currentUserId?: number | null;
}): Promise<ChatMessage> {
  const payload = await socialApiRequest<{
    status?: boolean | string;
    message?: string;
    data?: unknown;
  }>({
    path: "/api/social/chat/messages/share-event",
    method: "POST",
    auth: true,
    data: {
      receiver_id: input.receiverId,
      event_id: input.eventId,
      message_content: input.messageContent?.trim() ?? "",
    },
  });
  if (!isBackendSuccess(payload) || payload.data == null) {
    throw new ApiError(
      "SERVER",
      backendMessage(payload, "Unable to share event"),
      502
    );
  }
  return mapSocketMessage(payload.data, input.currentUserId ?? null);
}

export async function sendChatProfileShare(input: {
  receiverId: number;
  profileId: number;
  messageContent?: string;
  currentUserId?: number | null;
}): Promise<ChatMessage> {
  const payload = await socialApiRequest<{
    status?: boolean | string;
    message?: string;
    data?: unknown;
  }>({
    path: "/api/social/chat/messages/share-profile",
    method: "POST",
    auth: true,
    data: {
      receiver_id: input.receiverId,
      profile_id: input.profileId,
      message_content: input.messageContent?.trim() ?? "",
    },
  });
  if (!isBackendSuccess(payload) || payload.data == null) {
    throw new ApiError(
      "SERVER",
      backendMessage(payload, "Unable to share profile"),
      502
    );
  }
  return mapSocketMessage(payload.data, input.currentUserId ?? null);
}

export async function emitChatTyping(input: {
  conversationId: number;
  isTyping: boolean;
}): Promise<void> {
  const token = await getSessionToken();
  if (!token) {
    throw new ApiError("SESSION_EXPIRED", "Session required", 401);
  }
  await emitTypingViaSocket({
    token,
    conversationId: input.conversationId,
    isTyping: input.isTyping,
  });
}

export async function joinChatConversation(
  conversationId: number
): Promise<void> {
  const token = await getSessionToken();
  if (!token) {
    throw new ApiError("SESSION_EXPIRED", "Session required", 401);
  }
  await joinConversationViaSocket({ token, conversationId });
}

export async function leaveChatConversation(
  conversationId: number
): Promise<void> {
  const token = await getSessionToken();
  if (!token) {
    throw new ApiError("SESSION_EXPIRED", "Session required", 401);
  }
  await leaveConversationViaSocket({ token, conversationId });
}

async function postMessageAction(
  messageId: number,
  action: "edit" | "react" | "delete",
  data: Record<string, unknown>,
  fallback: string
): Promise<void> {
  const payload = await socialApiRequest<unknown>({
    path: `/api/social/chat/messages/${messageId}/${action}`,
    method: "POST",
    auth: true,
    data,
  });
  if (!isBackendSuccess(payload)) {
    throw new ApiError("SERVER", backendMessage(payload, fallback), 502);
  }
}

export async function editChatMessage(input: {
  messageId: number;
  content: string;
}): Promise<void> {
  await postMessageAction(
    input.messageId,
    "edit",
    { message_content: input.content },
    "Unable to edit message"
  );
}

export async function reactToChatMessage(input: {
  messageId: number;
  emoji: string;
}): Promise<void> {
  await postMessageAction(
    input.messageId,
    "react",
    { emoji: input.emoji },
    "Unable to react to message"
  );
}

export async function deleteChatMessage(input: {
  messageId: number;
  deleteForEveryone: boolean;
}): Promise<void> {
  await postMessageAction(
    input.messageId,
    "delete",
    { delete_for_everyone: input.deleteForEveryone },
    "Unable to delete message"
  );
}

/** Requires a verified phone (backend `requirePhoneVerification`). */
export async function blockChatUser(input: {
  userId: number;
  reason?: string;
}): Promise<void> {
  const payload = await socialApiRequest<unknown>({
    path: `/api/social/chat/block/${input.userId}`,
    method: "POST",
    auth: true,
    data: input.reason ? { reason: input.reason } : {},
  });
  if (!isBackendSuccess(payload)) {
    throw new ApiError("SERVER", backendMessage(payload, "Unable to block user"), 502);
  }
}

export async function unblockChatUser(userId: number): Promise<void> {
  const payload = await socialApiRequest<unknown>({
    path: `/api/social/chat/block/${userId}/unblock`,
    method: "POST",
    auth: true,
  });
  if (!isBackendSuccess(payload)) {
    throw new ApiError("SERVER", backendMessage(payload, "Unable to unblock user"), 502);
  }
}

export async function listBlockedChatUsers(): Promise<BlockedChatUser[]> {
  const payload = await socialApiRequest<unknown>({
    path: "/api/social/chat/blocked-users",
    method: "GET",
    auth: true,
  });
  if (!isBackendSuccess(payload)) {
    throw new ApiError(
      "SERVER",
      backendMessage(payload, "Unable to load blocked users"),
      502
    );
  }
  return mapBlockedUsers(payload);
}
