import "server-only";

import { io, type Socket } from "socket.io-client";
import { getEnv } from "@/lib/env";
import { ApiError } from "@/lib/api/errors";

function socketUrl(): string {
  return getEnv().SOCIAL_API_URL.replace(/\/$/, "");
}

function isOkStatus(status: unknown): boolean {
  return status === true || status === "true" || status === "True";
}

/**
 * Short-lived Socket.IO client authenticated with the HttpOnly session JWT.
 * Mirrors mobile SocketService emit + ack — token never reaches the browser.
 */
export function connectChatSocket(
  token: string,
  options?: { persistent?: boolean }
): Socket {
  const persistent = options?.persistent !== false;
  return io(socketUrl(), {
    auth: { token },
    transports: ["websocket", "polling"],
    autoConnect: true,
    forceNew: !persistent,
    reconnection: persistent,
    reconnectionAttempts: persistent ? 12 : 0,
    reconnectionDelay: 1500,
    timeout: 12_000,
  });
}

/** Socket.IO may connect before `connect` listeners attach (autoConnect race). */
function whenSocketReady(
  socket: Socket,
  onReady: () => void,
  onFail: (error: Error) => void
): void {
  if (socket.connected) {
    queueMicrotask(onReady);
    return;
  }
  socket.once("connect", onReady);
  socket.once("connect_error", (err) => {
    onFail(
      new ApiError("NETWORK", err.message || "Unable to connect to chat", 502)
    );
  });
}

export async function emitChatAck<T = unknown>(input: {
  token: string;
  event: string;
  payload: Record<string, unknown>;
  timeoutMs?: number;
}): Promise<T> {
  const { token, event, payload, timeoutMs = 15_000 } = input;

  return new Promise<T>((resolve, reject) => {
    let settled = false;
    let socket: Socket | null = null;

    const finish = (error?: Error, result?: T) => {
      if (settled) return;
      settled = true;
      clearTimeout(timer);
      try {
        socket?.removeAllListeners();
        socket?.disconnect();
      } catch {
        // ignore
      }
      if (error) reject(error);
      else if (result !== undefined) resolve(result);
      else reject(new ApiError("SERVER", "Empty socket response", 502));
    };

    const timer = setTimeout(() => {
      finish(new ApiError("NETWORK", "Chat socket timed out", 504));
    }, timeoutMs);

    socket = connectChatSocket(token, { persistent: false });

    whenSocketReady(
      socket,
      () => {
        socket?.emit(
          event,
          payload,
          (response: {
            status?: string | boolean;
            message?: string;
            data?: T;
          }) => {
            if (!isOkStatus(response?.status)) {
              finish(
                new ApiError(
                  "SERVER",
                  response?.message || `Unable to complete ${event}`,
                  502
                )
              );
              return;
            }
            finish(undefined, (response.data ?? ({} as T)) as T);
          }
        );
      },
      (err) => finish(err)
    );
  });
}

export type SendTextResult = {
  id: number;
  content: string;
  createdAt: string | null;
};

export async function sharePostViaSocket(input: {
  token: string;
  receiverId: number;
  postId: number;
  messageContent?: string;
}): Promise<unknown> {
  return emitChatAck({
    token: input.token,
    event: "share_post",
    payload: {
      receiver_id: input.receiverId,
      post_id: input.postId,
      message_content: input.messageContent?.trim() ?? "",
    },
  });
}

export async function shareJobViaSocket(input: {
  token: string;
  receiverId: number;
  jobId: number;
  messageContent?: string;
}): Promise<unknown> {
  return emitChatAck({
    token: input.token,
    event: "share_job",
    payload: {
      receiver_id: input.receiverId,
      job_id: input.jobId,
      message_content: input.messageContent?.trim() ?? "",
    },
  });
}

export async function shareEventViaSocket(input: {
  token: string;
  receiverId: number;
  eventId: number;
  messageContent?: string;
}): Promise<unknown> {
  return emitChatAck({
    token: input.token,
    event: "share_event",
    payload: {
      receiver_id: input.receiverId,
      event_id: input.eventId,
      message_content: input.messageContent?.trim() ?? "",
    },
  });
}

export async function shareProfileViaSocket(input: {
  token: string;
  receiverId: number;
  profileId: number;
  messageContent?: string;
}): Promise<unknown> {
  return emitChatAck({
    token: input.token,
    event: "share_profile",
    payload: {
      receiver_id: input.receiverId,
      profile_id: input.profileId,
      message_content: input.messageContent?.trim() ?? "",
    },
  });
}

export async function shareStoryReplyViaSocket(input: {
  token: string;
  receiverId: number;
  storyId: number;
  messageContent: string;
}): Promise<{ id: number }> {
  const data = await emitChatAck<{ id?: number | string }>({
    token: input.token,
    event: "share_story_reply",
    payload: {
      receiver_id: input.receiverId,
      story_id: input.storyId,
      message_content: input.messageContent,
    },
  });
  const id = Number(
    (data as { id?: number | string }).id ??
      (data as { message?: { id?: number | string } }).message?.id
  );
  if (!Number.isFinite(id)) {
    return { id: 0 };
  }
  return { id };
}

function parseSendTextResult(
  data: Record<string, unknown>,
  fallbackContent: string
): SendTextResult {
  const nested = asRecord(data.message) ?? data;
  const id = Number(nested.id ?? data.id);
  if (!Number.isFinite(id)) {
    throw new ApiError("SERVER", "Unable to send message", 502);
  }
  return {
    id,
    content: String(
      nested.message_content ?? data.message_content ?? fallbackContent
    ),
    createdAt:
      asString(nested.created_at) ?? asString(data.created_at) ?? null,
  };
}

function asRecord(value: unknown): Record<string, unknown> | null {
  return value && typeof value === "object" && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : null;
}

function asString(value: unknown): string | null {
  if (typeof value === "string" && value.trim()) return value.trim();
  return null;
}

export async function sendMessageViaSocket(input: {
  token: string;
  receiverId: number;
  messageContent: string;
  replyToMessageId?: number;
}): Promise<SendTextResult> {
  const data = await emitChatAck<Record<string, unknown>>({
    token: input.token,
    event: "send_message",
    payload: {
      receiver_id: input.receiverId,
      message_content: input.messageContent,
      ...(input.replyToMessageId
        ? { reply_to_message_id: input.replyToMessageId }
        : {}),
    },
  });

  return parseSendTextResult(data, input.messageContent);
}

export async function sendImageViaSocket(input: {
  token: string;
  receiverId: number;
  images: Array<{ image_url: string }>;
  messageContent?: string;
}): Promise<unknown> {
  return emitChatAck({
    token: input.token,
    event: "send_image",
    payload: {
      receiver_id: input.receiverId,
      images: input.images,
      message_content: input.messageContent ?? "",
    },
  });
}

export async function sendDocumentViaSocket(input: {
  token: string;
  receiverId: number;
  documentUrl: string;
  documentName: string;
  documentSize: number;
  messageContent?: string;
}): Promise<unknown> {
  return emitChatAck({
    token: input.token,
    event: "send_document",
    payload: {
      receiver_id: input.receiverId,
      document_url: input.documentUrl,
      document_name: input.documentName,
      document_size: input.documentSize,
      message_content: input.messageContent ?? "",
    },
  });
}

/** Fire-and-forget emit (typing / join / presence) — no ack required. */
export async function emitChatEvent(input: {
  token: string;
  event: string;
  payload: Record<string, unknown>;
  timeoutMs?: number;
}): Promise<void> {
  const { token, event, payload, timeoutMs = 8_000 } = input;

  return new Promise<void>((resolve, reject) => {
    let settled = false;
    let socket: Socket | null = null;

    const finish = (error?: Error) => {
      if (settled) return;
      settled = true;
      clearTimeout(timer);
      try {
        socket?.removeAllListeners();
        socket?.disconnect();
      } catch {
        // ignore
      }
      if (error) reject(error);
      else resolve();
    };

    const timer = setTimeout(() => {
      finish(new ApiError("NETWORK", "Chat socket timed out", 504));
    }, timeoutMs);

    socket = connectChatSocket(token, { persistent: false });

    whenSocketReady(
      socket,
      () => {
        socket?.emit(event, payload);
        // Give the packet a beat to flush before tearing down.
        setTimeout(() => finish(), 80);
      },
      (err) => finish(err)
    );
  });
}

export async function emitTypingViaSocket(input: {
  token: string;
  conversationId: number;
  isTyping: boolean;
}): Promise<void> {
  await emitChatEvent({
    token: input.token,
    event: "typing",
    payload: {
      conversation_id: input.conversationId,
      is_typing: input.isTyping,
    },
  });
}

export async function joinConversationViaSocket(input: {
  token: string;
  conversationId: number;
}): Promise<void> {
  await emitChatEvent({
    token: input.token,
    event: "join_conversation",
    payload: { conversation_id: input.conversationId },
  });
}

export async function leaveConversationViaSocket(input: {
  token: string;
  conversationId: number;
}): Promise<void> {
  await emitChatEvent({
    token: input.token,
    event: "leave_conversation",
    payload: { conversation_id: input.conversationId },
  });
}
