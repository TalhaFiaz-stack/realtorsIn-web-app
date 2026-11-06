"use client";

import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { INFLUENCER_CHALLENGE_SHORT } from "@/features/influencer/constants/influencer.constants";
import {
  useInfluencerMutations,
} from "@/features/influencer/hooks/use-influencer";
import {
  subscribeInfluencerFirstVideoPrompt,
  type InfluencerFirstVideoPrompt,
} from "@/features/influencer/lib/influencer-post-challenge-events";
import { showAppToast } from "@/lib/toast/app-toast";

export function InfluencerFirstVideoDialog() {
  const { startChallenge, dismissFirstPopup } = useInfluencerMutations();
  const [open, setOpen] = useState(false);
  const [prompt, setPrompt] = useState<InfluencerFirstVideoPrompt | null>(null);

  useEffect(() => {
    return subscribeInfluencerFirstVideoPrompt((payload) => {
      setPrompt(payload);
      setOpen(true);
    });
  }, []);

  const headline = prompt?.status.modalHeadline ?? "Earn the Influencer Badge";
  const body = prompt?.status.modalBody ?? INFLUENCER_CHALLENGE_SHORT;

  async function onStart() {
    try {
      await startChallenge.mutateAsync(true);
      setOpen(false);
      showAppToast.success(
        "Challenge started",
        "Your video will count toward the Influencer Badge."
      );
    } catch (error) {
      showAppToast.fromError(error, "Could not start challenge");
    }
  }

  async function onMaybeLater() {
    setOpen(false);
    try {
      await dismissFirstPopup.mutateAsync();
    } catch {
      /* ignore */
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{headline}</DialogTitle>
          <DialogDescription className="locale-dialog-text whitespace-pre-wrap text-start">
            {body}
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="gap-2 sm:gap-0">
          <Button type="button" variant="ghost" onClick={() => void onMaybeLater()}>
            Maybe later
          </Button>
          <Button
            type="button"
            disabled={startChallenge.isPending}
            onClick={() => void onStart()}
          >
            {startChallenge.isPending ? "Starting…" : "Start challenge"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
