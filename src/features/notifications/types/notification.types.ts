export type AppNotification = {
  id: number;
  type: string;
  fullName: string | null;
  userName: string | null;
  avatarUrl: string | null;
  actionText: string | null;
  createdAt: string | null;
  isRead: boolean;
  postId: number | null;
  storyId: number | null;
  connectionId: number | null;
  canAcceptConnection: boolean;
  conversationId: number | null;
  /**
   * Scalar row fields + metadata (type, *_id, screen, deep_link…) used to
   * resolve where a tap should go — same rules as push-notification clicks.
   */
  routing: Record<string, string | number | boolean | null>;
};

export type NotificationsPage = {
  notifications: AppNotification[];
  page: number;
  perPage: number;
  total: number;
  lastPage: number;
  hasNextPage: boolean;
};
