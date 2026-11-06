export type ChatUser = {
  id: number;
  name: string;
  userName: string | null;
  avatarUrl: string | null;
  isOnline: boolean;
};

export type ConversationSummary = {
  id: number;
  otherUser: ChatUser;
  lastMessage: string | null;
  lastMessageAt: string | null;
  unreadCount: number;
  isPinned: boolean;
  isMuted: boolean;
  isArchived: boolean;
};

export type ChatMessageType =
  | "text"
  | "image"
  | "document"
  | "post_share"
  | "job_share"
  | "event_share"
  | "profile_share"
  | "story_reply"
  | string;

export type ChatMessageImage = {
  url: string;
  thumbnailUrl: string | null;
};

export type ChatSharedPost = {
  id: number;
  authorName: string | null;
  userName: string | null;
  avatarUrl: string | null;
  description: string | null;
  imageUrl: string | null;
  isPropertyShare: boolean;
  isProjectShare: boolean;
  propertyTitle: string | null;
  propertyLocation: string | null;
  projectTitle: string | null;
  /** Off-plan embed from `project_data` (feed / chat parity). */
  projectData: Record<string, unknown> | null;
};

export type ChatSharedJob = {
  id: number;
  title: string | null;
  company: string | null;
  location: string | null;
  employmentType: string | null;
  jobType: string | null;
};

export type ChatSharedEvent = {
  id: number;
  title: string | null;
  category: string | null;
  coverUrl: string | null;
  location: string | null;
  startsAt: string | null;
};

export type ChatSharedProfile = {
  id: number;
  name: string | null;
  userName: string | null;
  avatarUrl: string | null;
  role: string | null;
  company: string | null;
};

export type ChatSharedStory = {
  id: number;
  ownerName: string | null;
  previewUrl: string | null;
  mediaType: string | null;
  isExpired: boolean;
};

export type ChatMessage = {
  id: number;
  conversationId: number;
  senderId: number;
  receiverId: number;
  content: string;
  messageType: ChatMessageType;
  createdAt: string | null;
  isRead: boolean;
  isDelivered: boolean;
  isOwn: boolean;
  imageUrl: string | null;
  images: ChatMessageImage[];
  documentUrl: string | null;
  documentName: string | null;
  documentSize: number | null;
  sharedPost: ChatSharedPost | null;
  sharedJob: ChatSharedJob | null;
  sharedEvent: ChatSharedEvent | null;
  sharedProfile: ChatSharedProfile | null;
  sharedStory: ChatSharedStory | null;
};

export type ConversationsPage = {
  conversations: ConversationSummary[];
  page: number;
  limit: number;
  total: number;
  hasMore: boolean;
};

export type MessagesPage = {
  messages: ChatMessage[];
  otherUser: ChatUser | null;
  page: number;
  limit: number;
  total: number;
  hasMore: boolean;
};
