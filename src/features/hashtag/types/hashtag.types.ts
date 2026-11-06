export type FollowedHashtag = {
  id: number;
  title: string;
  label: string;
  usageCount: number;
  followedAt: string | null;
};

export type FollowedHashtagsPage = {
  tags: FollowedHashtag[];
  page: number;
  total: number;
};
