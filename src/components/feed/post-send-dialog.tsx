"use client";

import { useEffect, useMemo, useState } from "react";
import {
  ArrowLeft,
  Check,
  Copy,
  ExternalLink,
  Mail,
  MessageCircle,
  Search,
  Share2,
} from "lucide-react";
import { Avatar, AvatarImage, AvatarPlaceholderFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { InlineLoader } from "@/components/states/inline-loader";
import {
  sharePostInChatRequest,
  startConversationRequest,
} from "@/features/chat/services/chat.client";
import { fetchConnections } from "@/features/network/services/network.client";
import type { NetworkPerson } from "@/features/network/types/network.types";
import {
  buildPostPublicUrl,
  buildPostShareMessage,
  getPostExternalChannels,
  getPostShareOptions,
  isPublicPost,
  openEmailShare,
  openWhatsAppShare,
  sharePostNative,
  type PostExternalChannelId,
  type PostShareOptionId,
} from "@/features/feed/lib/post-share";
import type { FeedPost } from "@/features/feed/types/post.types";
import { ApiError } from "@/lib/api/errors";
import { copyTextToClipboard } from "@/lib/clipboard";
import { cn } from "@/lib/utils";

function initials(name: string) {
  return name
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
}

function ConnectionsListShimmer() {
  return (
    <ul className="space-y-0.5" aria-busy="true" aria-label="Loading connections">
      {Array.from({ length: 6 }, (_, index) => (
        <li
          key={index}
          className="flex items-center gap-3 rounded-xl px-2 py-2"
        >
          <Skeleton className="h-9 w-9 shrink-0 rounded-full" />
          <span className="min-w-0 flex-1 space-y-1.5">
            <Skeleton className="h-3.5 w-32" />
            <Skeleton className="h-3 w-20" />
          </span>
          <Skeleton className="h-5 w-5 shrink-0 rounded" />
        </li>
      ))}
    </ul>
  );
}

type Step = "options" | "external" | "connections";
type CopiedKind = "link" | "share_text" | null;

function ShareBackButton({ onClick }: { onClick: () => void }) {
  return (
    <Button
      type="button"
      variant="ghost"
      size="sm"
      className="h-9 gap-1.5 px-2 text-muted-foreground hover:text-foreground"
      onClick={onClick}
    >
      <ArrowLeft className="h-4 w-4" />
      Back
    </Button>
  );
}

export function PostSendDialog({
  post,
  open,
  onOpenChange,
}: {
  post: FeedPost | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const [step, setStep] = useState<Step>("options");
  const [people, setPeople] = useState<NetworkPerson[]>([]);
  const [loadingPeople, setLoadingPeople] = useState(false);
  const [query, setQuery] = useState("");
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [pending, setPending] = useState(false);
  const [copied, setCopied] = useState<CopiedKind>(null);
  const [status, setStatus] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const options = useMemo(
    () => (post ? getPostShareOptions(post) : []),
    [post]
  );
  const externalChannels = useMemo(() => getPostExternalChannels(), [open]);

  useEffect(() => {
    if (!open) {
      setStep("options");
      setQuery("");
      setSelectedIds([]);
      setCopied(null);
      setStatus(null);
      setError(null);
      return;
    }
    if (post && !isPublicPost(post)) {
      setStep("connections");
    }
  }, [open, post]);

  useEffect(() => {
    if (!copied) return;
    const timer = window.setTimeout(() => setCopied(null), 2200);
    return () => window.clearTimeout(timer);
  }, [copied]);

  useEffect(() => {
    if (!status) return;
    const timer = window.setTimeout(() => setStatus(null), 2200);
    return () => window.clearTimeout(timer);
  }, [status]);

  useEffect(() => {
    if (!open || step !== "connections") return;
    let cancelled = false;
    setLoadingPeople(true);
    void fetchConnections({ type: "all", page: 1, limit: 50 })
      .then((page) => {
        if (!cancelled) setPeople(page.people);
      })
      .catch(() => {
        if (!cancelled) setPeople([]);
      })
      .finally(() => {
        if (!cancelled) setLoadingPeople(false);
      });
    return () => {
      cancelled = true;
    };
  }, [open, step]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return people;
    return people.filter(
      (person) =>
        person.name.toLowerCase().includes(q) ||
        (person.userName ?? "").toLowerCase().includes(q)
    );
  }, [people, query]);

  function goToStep(next: Step) {
    setStep(next);
    setCopied(null);
    setStatus(null);
    setError(null);
  }

  async function onOption(id: PostShareOptionId) {
    if (!post) return;
    setError(null);
    setStatus(null);
    setCopied(null);
    const url = buildPostPublicUrl(post.id);

    if (id === "msg") {
      goToStep("connections");
      return;
    }

    if (id === "copy") {
      const ok = await copyTextToClipboard(url);
      if (ok) {
        setCopied("link");
        setStatus("Link copied to clipboard");
      } else {
        setError("Could not copy link. Try again or share externally.");
      }
      return;
    }

    if (id === "external") {
      // Desktop browsers often lack a useful native share sheet — go straight
      // to channel picker. Mobile still tries native first.
      const canNative =
        typeof navigator !== "undefined" &&
        typeof navigator.share === "function" &&
        /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
      if (canNative) {
        const message = buildPostShareMessage(post, url);
        const native = await sharePostNative({
          title: post.authorName,
          text: message,
          url,
        });
        if (native === "shared") {
          setStatus("Shared");
          return;
        }
        if (native === "cancelled") return;
      }
      goToStep("external");
    }
  }

  async function onExternalChannel(id: PostExternalChannelId) {
    if (!post) return;
    setError(null);
    setStatus(null);
    setCopied(null);
    const url = buildPostPublicUrl(post.id);
    const message = buildPostShareMessage(post, url);

    if (id === "native") {
      const native = await sharePostNative({
        title: post.authorName,
        text: message,
        url,
      });
      if (native === "shared") setStatus("Shared");
      return;
    }

    if (id === "whatsapp") {
      openWhatsAppShare(message || url);
      return;
    }

    if (id === "email") {
      openEmailShare(`Post from ${post.authorName}`, message || url);
      return;
    }

    const ok = await copyTextToClipboard(message || url);
    if (ok) {
      setCopied("share_text");
      setStatus("Share text copied to clipboard");
    } else {
      setError("Could not copy share text. Try WhatsApp or email instead.");
    }
  }

  function togglePerson(userId: number) {
    setSelectedIds((prev) =>
      prev.includes(userId)
        ? prev.filter((id) => id !== userId)
        : [...prev, userId]
    );
  }

  async function sendToSelected() {
    if (!post || selectedIds.length === 0 || pending) return;
    setPending(true);
    setError(null);
    try {
      for (const receiverId of selectedIds) {
        await startConversationRequest(receiverId);
        await sharePostInChatRequest({
          receiverId,
          postId: post.id,
        });
      }
      setStatus(
        selectedIds.length === 1
          ? "Post shared in chat"
          : `Post shared with ${selectedIds.length} connections`
      );
      setSelectedIds([]);
      window.setTimeout(() => onOpenChange(false), 700);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Unable to send");
    } finally {
      setPending(false);
    }
  }

  const title =
    step === "connections"
      ? "Share as Message"
      : step === "external"
        ? "Share Externally"
        : "Share Post";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[min(88vh,640px)] max-w-md gap-0 overflow-hidden p-0 sm:rounded-2xl">
        <DialogHeader className="border-b border-border px-4 py-3">
          <div className="flex items-center gap-1">
            {step !== "options" &&
            !(step === "connections" && post && !isPublicPost(post)) ? (
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="-ml-1.5 h-8 w-8 shrink-0 rounded-full"
                aria-label="Back"
                onClick={() => goToStep("options")}
              >
                <ArrowLeft className="h-4 w-4" />
              </Button>
            ) : null}
            <DialogTitle className="flex-1">{title}</DialogTitle>
          </div>
          <DialogDescription className="sr-only">
            Copy a link, share externally, or send to connections.
          </DialogDescription>
        </DialogHeader>

        {step === "options" ? (
          <div className="space-y-1 p-2">
            {options.map((option) => {
              const isCopied = option.id === "copy" && copied === "link";
              const Icon = isCopied
                ? Check
                : option.id === "copy"
                  ? Copy
                  : option.id === "external"
                    ? ExternalLink
                    : MessageCircle;
              return (
                <button
                  key={option.id}
                  type="button"
                  className={cn(
                    "locale-text flex w-full items-start gap-3 rounded-xl px-3 py-3 text-start hover:bg-muted/60",
                    isCopied && "bg-emerald-500/5"
                  )}
                  onClick={() => void onOption(option.id)}
                >
                  <span
                    className={cn(
                      "mt-0.5 inline-flex h-10 w-10 items-center justify-center rounded-full bg-muted",
                      isCopied && "bg-emerald-500/15 text-emerald-600"
                    )}
                  >
                    <Icon className="h-5 w-5" />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block text-sm font-semibold">
                      {isCopied ? "Link copied" : option.title}
                    </span>
                    <span className="block text-xs text-muted-foreground">
                      {isCopied
                        ? "Ready to paste anywhere"
                        : option.description}
                    </span>
                  </span>
                </button>
              );
            })}
          </div>
        ) : step === "external" ? (
          <div className="flex min-h-0 flex-1 flex-col">
            <div className="space-y-1 p-2">
              {externalChannels.map((channel) => {
                const isCopied =
                  channel.id === "copy_text" && copied === "share_text";
                const Icon = isCopied
                  ? Check
                  : channel.id === "whatsapp"
                    ? MessageCircle
                    : channel.id === "email"
                      ? Mail
                      : channel.id === "copy_text"
                        ? Copy
                        : Share2;
                return (
                  <button
                    key={channel.id}
                    type="button"
                    className={cn(
                      "locale-text flex w-full items-start gap-3 rounded-xl px-3 py-3 text-start hover:bg-muted/60",
                      isCopied && "bg-emerald-500/5"
                    )}
                    onClick={() => void onExternalChannel(channel.id)}
                  >
                    <span
                      className={cn(
                        "mt-0.5 inline-flex h-10 w-10 items-center justify-center rounded-full bg-muted",
                        isCopied && "bg-emerald-500/15 text-emerald-600"
                      )}
                    >
                      <Icon className="h-5 w-5" />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block text-sm font-semibold">
                        {isCopied ? "Share text copied" : channel.title}
                      </span>
                      <span className="block text-xs text-muted-foreground">
                        {isCopied
                          ? "Ready to paste anywhere"
                          : channel.description}
                      </span>
                    </span>
                  </button>
                );
              })}
            </div>
            <div className="flex items-center border-t border-border px-2 py-2">
              <ShareBackButton onClick={() => goToStep("options")} />
            </div>
          </div>
        ) : (
          <div className="flex min-h-0 flex-1 flex-col">
            <div className="border-b border-border px-3 py-2">
              <div className="relative">
                <Search className="pointer-events-none absolute start-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <input
                  className="h-10 w-full rounded-lg border border-border bg-background ps-9 pe-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-primary/30"
                  placeholder="Search connections"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                />
              </div>
            </div>
            <div className="max-h-72 min-h-0 flex-1 overflow-y-auto p-2">
              {loadingPeople ? (
                <ConnectionsListShimmer />
              ) : filtered.length === 0 ? (
                <p className="px-3 py-6 text-center text-sm text-muted-foreground">
                  No connections found
                </p>
              ) : (
                <ul className="space-y-0.5">
                  {filtered.map((person) => {
                    if (person.userId == null) return null;
                    const selected = selectedIds.includes(person.userId);
                    return (
                      <li key={person.userId}>
                        <button
                          type="button"
                          className={cn(
                            "locale-text flex w-full items-center gap-3 rounded-xl px-2 py-2 text-start hover:bg-muted/60",
                            selected && "bg-primary/5"
                          )}
                          onClick={() => togglePerson(person.userId!)}
                          aria-pressed={selected}
                        >
                          <Avatar className="h-9 w-9">
                            {person.avatarUrl ? (
                              <AvatarImage src={person.avatarUrl} alt="" />
                            ) : null}
                            <AvatarPlaceholderFallback />
                          </Avatar>
                          <span className="min-w-0 flex-1">
                            <span className="block truncate text-sm font-semibold">
                              {person.name}
                            </span>
                            {person.userName ? (
                              <span className="block truncate text-xs text-muted-foreground">
                                @{person.userName}
                              </span>
                            ) : null}
                          </span>
                          <span
                            className={cn(
                              "inline-flex h-5 w-5 shrink-0 items-center justify-center rounded border",
                              selected
                                ? "border-primary bg-primary text-primary-foreground"
                                : "border-border bg-background"
                            )}
                            aria-hidden
                          >
                            {selected ? (
                              <Check className="h-3.5 w-3.5" strokeWidth={3} />
                            ) : null}
                          </span>
                        </button>
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>
            <div className="flex items-center justify-between gap-2 border-t border-border px-2 py-2">
              {post && isPublicPost(post) ? (
                <ShareBackButton onClick={() => goToStep("options")} />
              ) : (
                <span />
              )}
              <Button
                type="button"
                size="sm"
                disabled={pending || selectedIds.length === 0}
                onClick={() => void sendToSelected()}
              >
                {pending ? <InlineLoader /> : null}
                Send{selectedIds.length ? ` (${selectedIds.length})` : ""}
              </Button>
            </div>
          </div>
        )}

        {status ? (
          <p
            className="border-t border-border bg-muted/40 px-4 py-2.5 text-sm text-foreground"
            role="status"
          >
            {status}
          </p>
        ) : null}
        {error ? (
          <p
            className="border-t border-border px-4 py-2.5 text-sm text-destructive"
            role="alert"
          >
            {error}
          </p>
        ) : null}
      </DialogContent>
    </Dialog>
  );
}
