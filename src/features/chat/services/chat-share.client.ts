import {
  shareEventInChatRequest,
  shareJobInChatRequest,
  sharePostInChatRequest,
  shareProfileInChatRequest,
  startConversationRequest,
} from "@/features/chat/services/chat.client";
import type { ChatShareEntity } from "@/features/chat/types/content-share.types";

export async function shareEntityInChat(
  entity: ChatShareEntity,
  receiverId: number,
  messageContent?: string
) {
  const caption = messageContent?.trim() || undefined;
  await startConversationRequest(receiverId);
  switch (entity.type) {
    case "post":
      return sharePostInChatRequest({
        receiverId,
        postId: entity.postId,
        messageContent: caption,
      });
    case "job":
      return shareJobInChatRequest({
        receiverId,
        jobId: entity.jobId,
        messageContent: caption,
      });
    case "event":
      return shareEventInChatRequest({
        receiverId,
        eventId: entity.eventId,
        messageContent: caption,
      });
    case "profile":
      return shareProfileInChatRequest({
        receiverId,
        profileId: entity.profileId,
        messageContent: caption,
      });
    default:
      throw new Error("Unsupported share type");
  }
}
