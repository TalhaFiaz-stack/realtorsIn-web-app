import { ActivityPostsListPage } from "@/components/activities/activity-posts-list-page";

export const metadata = { title: "Saved posts" };

export default function ActivitySavedPage() {
  return (
    <ActivityPostsListPage kind="saved" title="Saved posts" />
  );
}
