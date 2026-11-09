"use client";

import { useCreatePostComposer } from "@/components/feed/create-post-provider";

import { useMemo, useState } from "react";
import { CalendarClock } from "lucide-react";
import { ScheduledPostsListSkeleton } from "@/components/feed/scheduled-posts-list-skeleton";
import { useConfirm } from "@/components/common/confirm-provider";
import { EmptyState } from "@/components/states/empty-state";
import { ErrorState } from "@/components/states/error-state";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { CONFIRM_CANCEL_SCHEDULED_POST } from "@/constants/confirm-copy";
import {
  scheduledPostsErrorMessage,
  useCancelScheduledPost,
  useScheduledPostsList,
  useUpdateScheduledPost,
} from "@/features/feed/hooks/use-scheduled-posts";
import type { ScheduledPost } from "@/features/feed/types/scheduled-post.types";
import { showAppToast } from "@/lib/toast/app-toast";

function toDatetimeLocalValue(isoOrLocal: string): string {
  if (!isoOrLocal) return "";
  if (!isoOrLocal.includes("T") || isoOrLocal.length <= 16) return isoOrLocal;
  const d = new Date(isoOrLocal);
  if (Number.isNaN(d.getTime())) return "";
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

function ScheduledPostRow({ post }: { post: ScheduledPost }) {
  const { confirm } = useConfirm();
  const cancel = useCancelScheduledPost();
  const update = useUpdateScheduledPost();
  const [editing, setEditing] = useState(false);
  const [localWhen, setLocalWhen] = useState(() =>
    toDatetimeLocalValue(post.scheduledAt)
  );

  const preview =
    post.description.trim() ||
    (post.isPropertyShare
      ? "Property listing"
      : post.isProjectShare
        ? "Project share"
        : "Scheduled post");

  async function onCancel() {
    const ok = await confirm({
      ...CONFIRM_CANCEL_SCHEDULED_POST,
      detail: preview.slice(0, 120),
    });
    if (!ok) return;
    try {
      const res = await cancel.mutateAsync(post.id);
      showAppToast.success("Schedule cancelled", res.message);
    } catch (error) {
      showAppToast.fromError(error, "Could not cancel");
    }
  }

  async function onSaveTime() {
    if (!localWhen) return;
    const when = new Date(localWhen);
    if (Number.isNaN(when.getTime()) || when.getTime() <= Date.now() + 60_000) {
      showAppToast.error(
        "Invalid time",
        "Pick a time at least one minute in the future."
      );
      return;
    }
    try {
      const res = await update.mutateAsync({
        postId: post.id,
        scheduledAt: when.toISOString(),
      });
      setEditing(false);
      showAppToast.success("Schedule updated", res.message);
    } catch (error) {
      showAppToast.fromError(error, "Could not update");
    }
  }

  const thumb = post.images[0]?.imageUrl;

  return (
    <article className="rounded-xl border border-border bg-card p-4 shadow-sm">
      <div className="flex gap-3">
        {thumb ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={thumb}
            alt=""
            className="h-16 w-16 shrink-0 rounded-lg object-cover"
          />
        ) : (
          <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-lg bg-muted">
            <CalendarClock className="h-6 w-6 text-muted-foreground" />
          </div>
        )}
        <div className="min-w-0 flex-1 space-y-1">
          <p className="line-clamp-3 text-sm text-foreground">{preview}</p>
          <p className="text-xs font-medium text-primary">
            Publishes {new Date(post.scheduledAt).toLocaleString()}
          </p>
          {post.visibility ? (
            <p className="text-xs text-muted-foreground capitalize">
              {post.visibility}
            </p>
          ) : null}
        </div>
      </div>

      {editing ? (
        <div className="mt-3 flex flex-wrap items-end gap-2">
          <div className="min-w-[200px] flex-1">
            <label className="text-xs text-muted-foreground" htmlFor={`t-${post.id}`}>
              New time
            </label>
            <Input
              id={`t-${post.id}`}
              type="datetime-local"
              value={localWhen}
              onChange={(e) => setLocalWhen(e.target.value)}
              className="mt-1"
            />
          </div>
          <Button
            type="button"
            size="sm"
            disabled={update.isPending}
            onClick={() => void onSaveTime()}
          >
            Save
          </Button>
          <Button
            type="button"
            size="sm"
            variant="ghost"
            onClick={() => setEditing(false)}
          >
            Cancel
          </Button>
        </div>
      ) : (
        <div className="mt-3 flex flex-wrap gap-2">
          <Button
            type="button"
            size="sm"
            variant="outline"
            onClick={() => setEditing(true)}
          >
            Reschedule
          </Button>
          <Button
            type="button"
            size="sm"
            variant="destructive"
            disabled={cancel.isPending}
            onClick={() => void onCancel()}
          >
            Cancel schedule
          </Button>
        </div>
      )}
    </article>
  );
}

export function ScheduledPostsScreen() {
  const { openComposer } = useCreatePostComposer();
  const query = useScheduledPostsList();
  const posts = useMemo(
    () => query.data?.pages.flatMap((p) => p.posts) ?? [],
    [query.data]
  );

  const initialLoading =
    query.isPending || (query.isFetching && posts.length === 0);

  if (initialLoading) {
    return <ScheduledPostsListSkeleton count={3} />;
  }

  if (query.isError) {
    return (
      <ErrorState
        title="Could not load scheduled posts"
        description={scheduledPostsErrorMessage(query.error)}
        onRetry={() => void query.refetch()}
      />
    );
  }

  if (posts.length === 0) {
    return (
      <EmptyState
        title="No scheduled posts"
        description="When you schedule a post from Create, it will appear here until it publishes."
        actionLabel="Create post"
        onAction={() => openComposer()}
      />
    );
  }

  return (
    <div className="space-y-3">
      {posts.map((post) => (
        <ScheduledPostRow key={post.id} post={post} />
      ))}
      {query.hasNextPage ? (
        <Button
          type="button"
          variant="outline"
          className="w-full"
          disabled={query.isFetchingNextPage}
          onClick={() => void query.fetchNextPage()}
        >
          {query.isFetchingNextPage ? "Loading…" : "Load more"}
        </Button>
      ) : null}
    </div>
  );
}
