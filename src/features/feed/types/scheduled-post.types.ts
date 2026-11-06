export type ScheduledPostImage = {
  id: number;
  imageUrl: string | null;
};

export type ScheduledPost = {
  id: number;
  description: string;
  scheduledAt: string;
  visibility: string | null;
  images: ScheduledPostImage[];
  isPropertyShare: boolean;
  isProjectShare: boolean;
  createdAt: string | null;
};

export type ScheduledPostsPage = {
  posts: ScheduledPost[];
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNextPage: boolean;
};
