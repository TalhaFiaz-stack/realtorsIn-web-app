"use client";

import { useState } from "react";
import { Repeat2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { InlineLoader } from "@/components/states/inline-loader";
import { useStoreRepost } from "@/features/feed/hooks/use-feed-post-actions";
import { ApiError } from "@/lib/api/errors";

export function PostRepostDialog({
  postId,
  open,
  onOpenChange,
}: {
  postId: number | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const repost = useStoreRepost();
  const [withThoughts, setWithThoughts] = useState(false);
  const [thoughts, setThoughts] = useState("");
  const [error, setError] = useState<string | null>(null);

  function reset() {
    setWithThoughts(false);
    setThoughts("");
    setError(null);
  }

  async function submit(repostText?: string) {
    if (!postId || repost.isPending) return;
    setError(null);
    try {
      await repost.mutateAsync({
        postId,
        repostText: repostText?.trim() || undefined,
      });
      onOpenChange(false);
      reset();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Unable to repost");
    }
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        onOpenChange(next);
        if (!next) reset();
      }}
    >
      <DialogContent className="max-w-md gap-0 p-0 sm:rounded-2xl">
        <DialogHeader className="border-b border-border px-4 py-3">
          <DialogTitle>Repost</DialogTitle>
          <DialogDescription className="sr-only">
            Instantly repost or add your thoughts first.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-2 p-3">
          {!withThoughts ? (
            <>
              <button
                type="button"
                disabled={repost.isPending}
                className="locale-text flex w-full items-start gap-3 rounded-xl px-3 py-3 text-start hover:bg-muted/60"
                onClick={() => void submit()}
              >
                <span className="mt-0.5 inline-flex h-10 w-10 items-center justify-center rounded-full bg-muted">
                  <Repeat2 className="h-5 w-5 text-foreground" />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block text-sm font-semibold">Repost</span>
                  <span className="block text-xs text-muted-foreground">
                    Instantly share this post with your network
                  </span>
                </span>
                {repost.isPending ? <InlineLoader /> : null}
              </button>
              <button
                type="button"
                disabled={repost.isPending}
                className="locale-text flex w-full items-start gap-3 rounded-xl px-3 py-3 text-start hover:bg-muted/60"
                onClick={() => setWithThoughts(true)}
              >
                <span className="mt-0.5 inline-flex h-10 w-10 items-center justify-center rounded-full bg-muted">
                  <Repeat2 className="h-5 w-5 text-primary" />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block text-sm font-semibold">
                    Repost with thoughts
                  </span>
                  <span className="block text-xs text-muted-foreground">
                    Add a comment before sharing
                  </span>
                </span>
              </button>
            </>
          ) : (
            <div className="space-y-3 px-1 py-1">
              <Textarea
                value={thoughts}
                onChange={(e) => setThoughts(e.target.value)}
                placeholder="Add your thoughts…"
                rows={4}
                disabled={repost.isPending}
              />
              <div className="flex justify-end gap-2">
                <Button
                  type="button"
                  variant="ghost"
                  disabled={repost.isPending}
                  onClick={() => setWithThoughts(false)}
                >
                  Back
                </Button>
                <Button
                  type="button"
                  disabled={repost.isPending}
                  onClick={() => void submit(thoughts)}
                >
                  {repost.isPending ? <InlineLoader /> : null}
                  Repost
                </Button>
              </div>
            </div>
          )}

          {error ? (
            <p className="px-3 pb-2 text-sm text-destructive" role="alert">
              {error}
            </p>
          ) : null}
        </div>
      </DialogContent>
    </Dialog>
  );
}
