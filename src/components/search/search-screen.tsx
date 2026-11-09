"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ShellBackLink } from "@/components/navigation/shell-back-link";
import { ShellBackRow } from "@/components/navigation/shell-back-row";
import { Search, X } from "lucide-react";
import { PostCard } from "@/components/feed/post-card";
import { FeedSkeleton } from "@/components/feed/feed-skeleton";
import { ReportPostDialog } from "@/components/feed/report-post-dialog";
import { EmptyState } from "@/components/states/empty-state";
import { ErrorState } from "@/components/states/error-state";
import { SearchAccountsSkeleton } from "@/components/states/list-row-skeleton";
import { Avatar, AvatarImage, AvatarPlaceholderFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  readRecentSearches,
  removeRecentSearch,
  useSearch,
  writeRecentSearch,
} from "@/features/feed/hooks/use-search";
import {
  useToggleLike,
  useToggleSave,
} from "@/features/feed/hooks/use-feed";
import type { SearchTab } from "@/features/feed/types/search.types";
import {
  useFollowHashtag,
  useFollowedHashtags,
  useUnfollowHashtag,
} from "@/features/hashtag/hooks/use-followed-hashtags";
import { ApiError } from "@/lib/api/errors";
import { cn } from "@/lib/utils";

const TABS: { id: SearchTab; label: string }[] = [
  { id: "foryou", label: "For you" },
  { id: "account", label: "Accounts" },
  { id: "tags", label: "Tags" },
];

function initials(name: string) {
  return name
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
}

function HashtagFollowButton({
  label,
  following,
  busy,
  onFollow,
  onUnfollow,
}: {
  label: string;
  following: boolean;
  busy: boolean;
  onFollow: () => void;
  onUnfollow: () => void;
}) {
  return (
    <Button
      type="button"
      size="sm"
      variant={following ? "outline" : "default"}
      className="h-8 shrink-0 rounded-full px-3 text-xs"
      disabled={busy}
      aria-pressed={following}
      aria-label={`${following ? "Unfollow" : "Follow"} #${label}`}
      onClick={following ? onUnfollow : onFollow}
    >
      {following ? "Following" : "Follow"}
    </Button>
  );
}

export function SearchScreen({
  initialQuery = "",
  initialTab = "foryou",
}: {
  initialQuery?: string;
  initialTab?: SearchTab;
}) {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [draft, setDraft] = useState(initialQuery);
  const [committed, setCommitted] = useState(initialQuery);
  const [tab, setTab] = useState<SearchTab>(initialTab);
  const [focused, setFocused] = useState(false);
  const [recent, setRecent] = useState<string[]>([]);
  const [reportPostId, setReportPostId] = useState<number | null>(null);
  const sentinelRef = useRef<HTMLDivElement | null>(null);

  const search = useSearch(tab, committed, true);
  const followedQuery = useFollowedHashtags();
  const followMutation = useFollowHashtag();
  const unfollowMutation = useUnfollowHashtag();
  const followedIds = new Set(
    (followedQuery.data?.tags ?? []).map((t) => t.id)
  );
  const likeMutation = useToggleLike();
  const saveMutation = useToggleSave();

  useEffect(() => {
    setRecent(readRecentSearches());
    inputRef.current?.focus();
  }, []);

  useEffect(() => {
    const node = sentinelRef.current;
    if (!node) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (
          entries[0]?.isIntersecting &&
          search.hasNextPage &&
          !search.isFetchingNextPage
        ) {
          void search.fetchNextPage();
        }
      },
      { rootMargin: "240px" }
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, [search.fetchNextPage, search.hasNextPage, search.isFetchingNextPage]);

  function submit(term = draft) {
    const next = term.trim();
    setCommitted(next);
    setDraft(next);
    setFocused(false);
    if (next) setRecent(writeRecentSearch(next));
    const params = new URLSearchParams();
    if (next) params.set("q", next);
    if (tab !== "foryou") params.set("tab", tab);
    router.replace(params.toString() ? `/search?${params}` : "/search");
  }

  function selectTab(next: SearchTab) {
    if (next === tab || search.isLoading) return;
    setTab(next);
    const params = new URLSearchParams();
    if (committed) params.set("q", committed);
    if (next !== "foryou") params.set("tab", next);
    router.replace(params.toString() ? `/search?${params}` : "/search");
  }

  const showRecent = focused && recent.length > 0;

  return (
    <div className="mx-auto w-full max-w-2xl space-y-3 pb-8">
      <div className="px-4 md:px-0">
        <ShellBackRow>
          <ShellBackLink href="/feed" label="Home" />
        </ShellBackRow>
      </div>
      <div className="flex items-center gap-2 px-4 md:px-0">
        <div className="relative min-w-0 flex-1">
          <Search className="pointer-events-none absolute start-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            ref={inputRef}
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onFocus={() => setFocused(true)}
            onBlur={() => {
              window.setTimeout(() => setFocused(false), 150);
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                submit();
              }
            }}
            placeholder="Search posts, people, or tags"
            aria-label="Search"
            className="h-11 rounded-full border-transparent bg-muted ps-9 pe-10"
          />
          {draft ? (
            <button
              type="button"
              className="absolute end-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              aria-label="Clear search"
              onClick={() => {
                setDraft("");
                setCommitted("");
                submit("");
              }}
            >
              <X className="h-4 w-4" />
            </button>
          ) : null}
        </div>
      </div>

      {showRecent ? (
        <section className="rounded-[var(--radius)] border border-border bg-card px-2 py-2 shadow-sm">
          <p className="px-2 py-1 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Recent
          </p>
          <ul>
            {recent.map((item) => (
              <li key={item} className="flex items-center gap-1">
                <button
                  type="button"
                  className="locale-text min-w-0 flex-1 truncate rounded-md px-3 py-2 text-start text-sm hover:bg-muted"
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => submit(item)}
                >
                  {item}
                </button>
                <button
                  type="button"
                  className="rounded-md p-2 text-muted-foreground hover:bg-muted hover:text-foreground"
                  aria-label={`Remove ${item}`}
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => setRecent(removeRecentSearch(item))}
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </li>
            ))}
          </ul>
        </section>
      ) : (
        <>
          <div className="flex gap-1 border-b border-border px-4 md:px-0">
            {TABS.map((item) => {
              const active = tab === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  disabled={search.isLoading}
                  onClick={() => selectTab(item.id)}
                  className={cn(
                    "px-3 py-2.5 text-sm font-medium transition-colors",
                    active
                      ? "border-b-2 border-primary font-semibold text-primary"
                      : "border-b-2 border-transparent text-muted-foreground hover:text-foreground"
                  )}
                >
                  {item.label}
                </button>
              );
            })}
          </div>

          <div className="space-y-3 px-4 md:px-0">
            {search.isLoading ? (
              tab === "foryou" ? (
                <FeedSkeleton count={3} />
              ) : (
                <SearchAccountsSkeleton count={6} />
              )
            ) : search.error ? (
              <ErrorState
                title="Search unavailable"
                description={
                  search.error instanceof ApiError
                    ? search.error.message
                    : "Could not load results."
                }
                onRetry={() => void search.refetch()}
              />
            ) : tab === "foryou" ? (
              search.posts.length === 0 ? (
                <EmptyState
                  title={committed ? "No posts found" : "Search the feed"}
                  description={
                    committed
                      ? "Try another keyword or switch to Accounts / Tags."
                      : "Type a keyword and press Enter to find posts."
                  }
                />
              ) : (
                search.posts.map((post) => (
                  <PostCard
                    key={post.id}
                    post={post}
                    saving={
                      saveMutation.isPending &&
                      saveMutation.variables === post.id
                    }
                    onLike={(input) => likeMutation.mutate(input)}
                    onSave={(id) => saveMutation.mutate(id)}
                    onReport={setReportPostId}
                  />
                ))
              )
            ) : tab === "account" ? (
              search.people.length === 0 ? (
                <EmptyState
                  title={committed ? "No people found" : "Find accounts"}
                  description={
                    committed
                      ? "Try a different name or username."
                      : "Search by name or @username, or browse your connections."
                  }
                />
              ) : (
                <ul className="divide-y divide-border overflow-hidden rounded-[var(--radius)] border border-border bg-card">
                  {search.people.map((person) => {
                    const href = person.userName
                      ? `/u/${person.userName}`
                      : person.userId != null
                        ? `/profile/${person.userId}`
                        : "/connections";
                    return (
                      <li key={`${person.userId}-${person.userName}`}>
                        <Link
                          href={href}
                          className="flex items-center gap-3 px-4 py-3 hover:bg-muted/50"
                        >
                          <Avatar className="h-11 w-11">
                            {person.avatarUrl ? (
                              <AvatarImage src={person.avatarUrl} alt="" />
                            ) : null}
                            <AvatarPlaceholderFallback />
                          </Avatar>
                          <div className="min-w-0 flex-1">
                            <p className="truncate text-sm font-semibold">
                              {person.name}
                            </p>
                            <p className="truncate text-xs text-muted-foreground">
                              {[
                                person.userName ? `@${person.userName}` : null,
                                person.role,
                                person.company,
                              ]
                                .filter(Boolean)
                                .join(" · ")}
                            </p>
                          </div>
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              )
            ) : search.tags.length === 0 ? (
              <EmptyState
                title={committed ? "No tags found" : "Browse tags"}
                description={
                  committed
                    ? "Try another hashtag keyword."
                    : "Search hashtags used across the feed."
                }
              />
            ) : (
              <ul className="divide-y divide-border overflow-hidden rounded-[var(--radius)] border border-border bg-card">
                {search.tags.map((tag) => {
                  const label = tag.tag.replace(/^#/, "");
                  return (
                    <li
                      key={`${tag.hashtagId}-${tag.tag}`}
                      className="flex items-center gap-2 pe-3 hover:bg-muted/50"
                    >
                      <button
                        type="button"
                        className="flex min-w-0 flex-1 items-center gap-3 px-4 py-3 text-start"
                        onClick={() => {
                          setTab("foryou");
                          submit(label);
                        }}
                      >
                        <span className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-muted text-lg font-bold text-primary">
                          #
                        </span>
                        <span className="min-w-0 flex-1">
                          <span className="block truncate text-sm font-semibold">
                            {tag.tag}
                          </span>
                          <span className="block text-xs text-muted-foreground">
                            {tag.count} posts
                          </span>
                        </span>
                      </button>
                      <HashtagFollowButton
                        label={label}
                        following={tag.hashtagId != null && followedIds.has(tag.hashtagId)}
                        busy={followMutation.isPending || unfollowMutation.isPending}
                        onFollow={() =>
                          followMutation.mutate({
                            hashtagId: tag.hashtagId ?? undefined,
                            hashtag: label,
                          })
                        }
                        onUnfollow={() =>
                          unfollowMutation.mutate({
                            hashtagId: tag.hashtagId ?? undefined,
                            hashtag: label,
                          })
                        }
                      />
                    </li>
                  );
                })}
              </ul>
            )}

            {search.isFetchingNextPage ? (
              tab === "foryou" ? (
                <FeedSkeleton count={1} className="space-y-0 px-0" />
              ) : (
                <SearchAccountsSkeleton count={2} />
              )
            ) : null}
            <div ref={sentinelRef} className="h-px w-full shrink-0" aria-hidden />
          </div>
        </>
      )}

      <ReportPostDialog
        postId={reportPostId}
        open={reportPostId != null}
        onOpenChange={(open) => {
          if (!open) setReportPostId(null);
        }}
      />
    </div>
  );
}
