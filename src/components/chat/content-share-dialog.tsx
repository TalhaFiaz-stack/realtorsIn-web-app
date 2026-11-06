"use client";

import { useEffect, useMemo, useState } from "react";
import {
  ArrowLeft,
  Check,
  Copy,
  ExternalLink,
  MessageCircle,
  Search,
  Share2,
} from "lucide-react";
import {
  Avatar,
  AvatarImage,
  AvatarPlaceholderFallback,
} from "@/components/ui/avatar";
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
  CONTENT_SHARE_OPTIONS,
  chatShareSuccessLabel,
  type ContentShareOptionId,
} from "@/features/chat/lib/content-share";
import { shareEntityInChat } from "@/features/chat/services/chat-share.client";
import type { ChatShareEntity } from "@/features/chat/types/content-share.types";
import { fetchConnections } from "@/features/network/services/network.client";
import type { NetworkPerson } from "@/features/network/types/network.types";
import {
  getPostExternalChannels,
  openEmailShare,
  openWhatsAppShare,
  sharePostNative,
  type PostExternalChannelId,
} from "@/features/feed/lib/post-share";
import { ApiError } from "@/lib/api/errors";
import { copyTextToClipboard } from "@/lib/clipboard";
import { cn } from "@/lib/utils";

type Step = "options" | "external" | "connections";

function ConnectionsListShimmer() {
  return (
    <ul className="space-y-0.5" aria-busy="true">
      {Array.from({ length: 5 }, (_, i) => (
        <li key={i} className="flex items-center gap-3 rounded-xl px-2 py-2">
          <Skeleton className="h-9 w-9 rounded-full" />
          <Skeleton className="h-4 w-32 flex-1" />
        </li>
      ))}
    </ul>
  );
}

export function ContentShareDialog({
  open,
  onOpenChange,
  dialogTitle,
  publicUrl,
  externalTitle,
  externalMessage,
  chatEntity,
  messageOnly = false,
  allowMessageShare = true,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  dialogTitle: string;
  publicUrl: string;
  externalTitle: string;
  externalMessage: string;
  chatEntity: ChatShareEntity | null;
  /** Hide copy / external — only in-app message (e.g. private posts). */
  messageOnly?: boolean;
  /** When false, omits “Share as Message” (no chat payload). */
  allowMessageShare?: boolean;
}) {
  const [step, setStep] = useState<Step>("options");
  const [people, setPeople] = useState<NetworkPerson[]>([]);
  const [loadingPeople, setLoadingPeople] = useState(false);
  const [query, setQuery] = useState("");
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [pending, setPending] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedText, setCopiedText] = useState(false);
  const [status, setStatus] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const options = useMemo(() => {
    if (messageOnly) {
      return CONTENT_SHARE_OPTIONS.filter((o) => o.id === "msg");
    }
    if (!allowMessageShare) {
      return CONTENT_SHARE_OPTIONS.filter((o) => o.id !== "msg");
    }
    return CONTENT_SHARE_OPTIONS;
  }, [allowMessageShare, messageOnly]);
  const externalChannels = useMemo(() => getPostExternalChannels(), []);

  useEffect(() => {
    if (!open) {
      setStep(messageOnly ? "connections" : "options");
      setQuery("");
      setSelectedIds([]);
      setCopiedLink(false);
      setCopiedText(false);
      setStatus(null);
      setError(null);
      return;
    }
    if (messageOnly) setStep("connections");
  }, [open, messageOnly]);

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
    setError(null);
    setStatus(null);
  }

  async function onOption(id: ContentShareOptionId) {
    setError(null);
    setStatus(null);
    if (id === "msg") {
      goToStep("connections");
      return;
    }
    if (id === "copy") {
      const ok = await copyTextToClipboard(publicUrl);
      if (ok) {
        setCopiedLink(true);
        setStatus("Link copied to clipboard");
      } else {
        setError("Could not copy link.");
      }
      return;
    }
    if (id === "external") {
      const canNative =
        typeof navigator !== "undefined" &&
        typeof navigator.share === "function" &&
        /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
      if (canNative) {
        const native = await sharePostNative({
          title: externalTitle,
          text: externalMessage,
          url: publicUrl,
        });
        if (native === "shared") setStatus("Shared");
        if (native !== "cancelled" && native !== "shared") goToStep("external");
        return;
      }
      goToStep("external");
    }
  }

  async function onExternalChannel(id: PostExternalChannelId) {
    setError(null);
    if (id === "native") {
      const native = await sharePostNative({
        title: externalTitle,
        text: externalMessage,
        url: publicUrl,
      });
      if (native === "shared") setStatus("Shared");
      return;
    }
    if (id === "whatsapp") {
      openWhatsAppShare(externalMessage || publicUrl);
      return;
    }
    if (id === "email") {
      openEmailShare(externalTitle, externalMessage || publicUrl);
      return;
    }
    const ok = await copyTextToClipboard(externalMessage || publicUrl);
    if (ok) {
      setCopiedText(true);
      setStatus("Share text copied");
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
    if (!chatEntity || selectedIds.length === 0 || pending) return;
    setPending(true);
    setError(null);
    try {
      for (const receiverId of selectedIds) {
        await shareEntityInChat(chatEntity, receiverId);
      }
      setStatus(chatShareSuccessLabel(chatEntity, selectedIds.length));
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
        : dialogTitle;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[min(88vh,640px)] max-w-md gap-0 overflow-hidden p-0 sm:rounded-2xl">
        <DialogHeader className="border-b border-border px-4 py-3">
          <div className="flex items-center gap-1">
            {step !== "options" && !messageOnly ? (
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
            Share via link, external apps, or direct message.
          </DialogDescription>
        </DialogHeader>

        {step === "options" ? (
          <div className="space-y-1 p-2">
            {options.map((option) => {
              const isCopied = option.id === "copy" && copiedLink;
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
                  <span className="mt-0.5 inline-flex h-10 w-10 items-center justify-center rounded-full bg-muted">
                    <Icon className="h-5 w-5" />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block text-sm font-semibold">
                      {isCopied ? "Link copied" : option.title}
                    </span>
                    <span className="block text-xs text-muted-foreground">
                      {option.description}
                    </span>
                  </span>
                </button>
              );
            })}
          </div>
        ) : step === "external" ? (
          <div className="space-y-1 p-2">
            {externalChannels.map((channel) => {
              const isCopied =
                channel.id === "copy_text" && copiedText;
              const Icon = isCopied ? Check : Share2;
              return (
                <button
                  key={channel.id}
                  type="button"
                  className="locale-text flex w-full items-start gap-3 rounded-xl px-3 py-3 text-start hover:bg-muted/60"
                  onClick={() => void onExternalChannel(channel.id)}
                >
                  <span className="mt-0.5 inline-flex h-10 w-10 items-center justify-center rounded-full bg-muted">
                    <Icon className="h-5 w-5" />
                  </span>
                  <span className="block text-sm font-semibold">
                    {channel.title}
                  </span>
                </button>
              );
            })}
          </div>
        ) : (
          <div className="flex min-h-0 flex-col">
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
            <div className="max-h-72 overflow-y-auto p-2">
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
                            "flex w-full items-center gap-3 rounded-xl px-2 py-2 text-start hover:bg-muted/60",
                            selected && "bg-primary/5"
                          )}
                          onClick={() => togglePerson(person.userId!)}
                        >
                          <Avatar className="h-9 w-9">
                            {person.avatarUrl ? (
                              <AvatarImage src={person.avatarUrl} alt="" />
                            ) : null}
                            <AvatarPlaceholderFallback />
                          </Avatar>
                          <span className="min-w-0 flex-1 truncate text-sm font-semibold">
                            {person.name}
                          </span>
                          <span
                            className={cn(
                              "inline-flex h-5 w-5 shrink-0 items-center justify-center rounded border",
                              selected
                                ? "border-primary bg-primary text-primary-foreground"
                                : "border-border"
                            )}
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
            <div className="flex justify-end border-t border-border px-2 py-2">
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
          <p className="border-t border-border bg-muted/40 px-4 py-2.5 text-sm">
            {status}
          </p>
        ) : null}
        {error ? (
          <p className="border-t border-border px-4 py-2.5 text-sm text-destructive">
            {error}
          </p>
        ) : null}
      </DialogContent>
    </Dialog>
  );
}
