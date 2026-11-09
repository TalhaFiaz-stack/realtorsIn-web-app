import type { ChatMessage } from "@/features/chat/types/chat.types";

export function createOptimisticChatMessage(input: {
  tempId: number;
  conversationId: number;
  receiverId: number;
  content: string;
}): ChatMessage {
  return {
    id: input.tempId,
    conversationId: input.conversationId,
    senderId: 0,
    receiverId: input.receiverId,
    content: input.content,
    messageType: "text",
    createdAt: new Date().toISOString(),
    isRead: false,
    isDelivered: false,
    isOwn: true,
    imageUrl: null,
    images: [],
    documentUrl: null,
    documentName: null,
    documentSize: null,
    sharedPost: null,
    sharedJob: null,
    sharedEvent: null,
    sharedProfile: null,
    sharedStory: null,
    isEdited: false,
    isDeleted: false,
    reactions: [],
  };
}

export function isOptimisticMessageId(id: number): boolean {
  return id < 0;
}
