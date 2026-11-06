import { bffRequest } from "@/lib/api/client";
import type {
  ChatMessage,
  ConversationsPage,
  MessagesPage,
} from "@/features/chat/types/chat.types";

export async function fetchConversations(
  page = 1,
  signal?: AbortSignal,
  search?: string
) {
  return bffRequest<{ ok: true } & ConversationsPage>({
    path: "chat/conversations",
    method: "GET",
    params: {
      page,
      limit: 20,
      ...(search?.trim() ? { search: search.trim() } : {}),
    },
    signal,
  });
}

export async function pinConversationRequest(input: {
  conversationId: number;
  isPinned: boolean;
}) {
  return bffRequest<{ ok: true }>({
    path: `chat/conversations/${input.conversationId}/pin`,
    method: "POST",
    data: { isPinned: input.isPinned },
  });
}

export async function muteConversationRequest(input: {
  conversationId: number;
  isMuted: boolean;
}) {
  return bffRequest<{ ok: true }>({
    path: `chat/conversations/${input.conversationId}/mute`,
    method: "POST",
    data: { isMuted: input.isMuted },
  });
}

export async function archiveConversationRequest(input: {
  conversationId: number;
  isArchived: boolean;
}) {
  return bffRequest<{ ok: true }>({
    path: `chat/conversations/${input.conversationId}/archive`,
    method: "POST",
    data: { isArchived: input.isArchived },
  });
}

export async function deleteConversationRequest(conversationId: number) {
  return bffRequest<{ ok: true }>({
    path: `chat/conversations/${conversationId}/delete`,
    method: "POST",
  });
}

export async function fetchMessages(
  conversationId: number,
  page = 1,
  signal?: AbortSignal
) {
  return bffRequest<{ ok: true } & MessagesPage>({
    path: `chat/conversations/${conversationId}/messages`,
    method: "GET",
    params: { page, limit: 50 },
    signal,
  });
}

export async function startConversationRequest(receiverId: number) {
  return bffRequest<{ ok: true; conversationId: number }>({
    path: "chat/start",
    method: "POST",
    data: { receiverId },
  });
}

export async function sendMessageRequest(input: {
  receiverId: number;
  messageContent: string;
}) {
  return bffRequest<{
    ok: true;
    message: { id: number; content: string; createdAt: string | null };
  }>({
    path: "chat/send",
    method: "POST",
    data: input,
  });
}

/** Same as mobile `SocketService.sharePost` — creates `post_share` with rich card payload. */
export async function sharePostInChatRequest(input: {
  receiverId: number;
  postId: number;
  messageContent?: string;
}) {
  return bffRequest<{ ok: true; message: ChatMessage }>({
    path: "chat/share-post",
    method: "POST",
    data: input,
  });
}

export async function shareJobInChatRequest(input: {
  receiverId: number;
  jobId: number;
  messageContent?: string;
}) {
  return bffRequest<{ ok: true; message: ChatMessage }>({
    path: "chat/share-job",
    method: "POST",
    data: input,
  });
}

export async function shareEventInChatRequest(input: {
  receiverId: number;
  eventId: number;
  messageContent?: string;
}) {
  return bffRequest<{ ok: true; message: ChatMessage }>({
    path: "chat/share-event",
    method: "POST",
    data: input,
  });
}

export async function shareProfileInChatRequest(input: {
  receiverId: number;
  profileId: number;
  messageContent?: string;
}) {
  return bffRequest<{ ok: true; message: ChatMessage }>({
    path: "chat/share-profile",
    method: "POST",
    data: input,
  });
}

export async function uploadChatFileRequest(file: File) {
  const form = new FormData();
  form.append("file", file, file.name);
  return bffRequest<{
    ok: true;
    fileUrl: string;
    fileName: string;
    fileSize: number;
    fileType: string;
  }>({
    path: "chat/upload",
    method: "POST",
    data: form,
    timeoutMs: 60_000,
  });
}

export async function sendImageRequest(input: {
  receiverId: number;
  imageUrls: string[];
  messageContent?: string;
}) {
  return bffRequest<{ ok: true; message: ChatMessage }>({
    path: "chat/send-image",
    method: "POST",
    data: input,
  });
}

export async function sendDocumentRequest(input: {
  receiverId: number;
  documentUrl: string;
  documentName: string;
  documentSize: number;
  messageContent?: string;
}) {
  return bffRequest<{ ok: true; message: ChatMessage }>({
    path: "chat/send-document",
    method: "POST",
    data: input,
  });
}

export async function markReadRequest(conversationId: number) {
  return bffRequest<{ ok: true }>({
    path: "chat/read",
    method: "POST",
    data: { conversationId },
  });
}

export async function fetchChatUnread(signal?: AbortSignal) {
  return bffRequest<{
    ok: true;
    totalUnread: number;
    conversationsWithUnread: number;
  }>({
    path: "chat/unread",
    method: "GET",
    signal,
  });
}

export async function emitTypingRequest(input: {
  conversationId: number;
  isTyping: boolean;
}) {
  return bffRequest<{ ok: true }>({
    path: "chat/typing",
    method: "POST",
    data: input,
  });
}

export async function joinConversationSocketRequest(
  conversationId: number,
  action: "join" | "leave" = "join"
) {
  return bffRequest<{ ok: true }>({
    path: "chat/join",
    method: "POST",
    data: { conversationId, action },
  });
}
