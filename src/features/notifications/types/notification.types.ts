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
};

export type NotificationsPage = {
  notifications: AppNotification[];
  page: number;
  perPage: number;
  total: number;
  lastPage: number;
  hasNextPage: boolean;
};
