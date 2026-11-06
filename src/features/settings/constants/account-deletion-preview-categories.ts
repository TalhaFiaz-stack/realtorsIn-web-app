/** Mirrors mobile `AccountDeletionPreviewModal` groupings. */
export const ACCOUNT_DELETION_PREVIEW_CATEGORIES = [
  {
    title: "User-Generated Content",
    items: [
      { label: "Posts", key: "posts" as const },
      { label: "Comments", key: "comments" as const },
      { label: "Likes", key: "likes" as const },
      { label: "Reposts", key: "reposts" as const },
    ],
  },
  {
    title: "Social Connections",
    items: [
      { label: "Connections", key: "connections" as const },
      { label: "Notifications", key: "notifications" as const },
    ],
  },
  {
    title: "Chat & Messages",
    items: [
      { label: "Chat Messages", key: "chatMessages" as const },
      { label: "Conversations", key: "chatConversations" as const },
    ],
  },
  {
    title: "Profile Information",
    items: [
      { label: "Education Records", key: "education" as const },
      { label: "Work Positions", key: "positions" as const },
      { label: "Certificates", key: "certificates" as const },
      { label: "Skills", key: "skills" as const },
    ],
  },
];
