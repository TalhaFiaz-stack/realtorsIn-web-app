"use client";

import { PostCard } from "@/components/feed/post-card";
import { FeedEventsSuggestionsRow } from "@/components/feed/feed-events-suggestions-row";
import { FeedJobsSuggestionsRow } from "@/components/feed/feed-jobs-suggestions-row";
import { FeedOffPlanSuggestionsRow } from "@/components/feed/feed-offplan-suggestions-row";
import {
  FeedPeopleSuggestionsRow,
  isPeopleModule,
} from "@/components/feed/feed-people-suggestions-row";
import type { FeedListRow } from "@/features/feed/lib/merge-feed-with-suggestions";
import type { PostReactionType } from "@/features/feed/constants/post-reactions";

type PostCardHandlers = {
  saving: boolean;
  onLike: (input: {
    postId: number;
    reactionType?: PostReactionType | null;
    isTapToggle?: boolean;
  }) => void;
  onSave: (id: number) => void;
  onReport: (id: number) => void;
  onComment: (id: number) => void;
  onRepost: (id: number) => void;
  onSend: (id: number) => void;
  onReactions: (id: number) => void;
  onHide: (id: number) => void;
  onNotInterested: (id: number) => void;
  onDelete: (id: number) => void;
  onPin?: (input: { postId: number; pinned: boolean }) => void;
  onUndoRepost: (id: number) => void;
  savePostId?: number;
  expandedCommentsPostId: number | null;
  commentsViewerName: string;
  commentsViewerAvatarUrl?: string | null;
};

export function FeedListRow({
  row,
  handlers,
}: {
  row: FeedListRow;
  handlers: PostCardHandlers;
}) {
  if (row.kind === "post") {
    const post = row.post;
    return (
      <PostCard
        post={post}
        saving={handlers.saving && handlers.savePostId === post.id}
        commentsExpanded={handlers.expandedCommentsPostId === post.id}
        commentsViewerName={handlers.commentsViewerName}
        commentsViewerAvatarUrl={handlers.commentsViewerAvatarUrl}
        onLike={handlers.onLike}
        onSave={handlers.onSave}
        onReport={handlers.onReport}
        onComment={handlers.onComment}
        onRepost={handlers.onRepost}
        onSend={handlers.onSend}
        onReactions={handlers.onReactions}
        onHide={handlers.onHide}
        onNotInterested={handlers.onNotInterested}
        onDelete={handlers.onDelete}
        onPin={handlers.onPin}
        onUndoRepost={handlers.onUndoRepost}
      />
    );
  }

  if (isPeopleModule(row.moduleType) && row.people?.length) {
    return (
      <FeedPeopleSuggestionsRow
        moduleType={row.moduleType}
        people={row.people}
      />
    );
  }

  if (row.moduleType === "offplan_suggestions" && row.offPlanSection) {
    return <FeedOffPlanSuggestionsRow section={row.offPlanSection} />;
  }

  if (row.moduleType === "job_suggestions" && row.jobs?.length) {
    return <FeedJobsSuggestionsRow jobs={row.jobs} />;
  }

  if (row.moduleType === "event_suggestions" && row.events?.length) {
    return <FeedEventsSuggestionsRow events={row.events} />;
  }

  return null;
}
