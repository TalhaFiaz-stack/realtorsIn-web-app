"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
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
  useInfluencerStatus,
} from "@/features/influencer/hooks/use-influencer";
import { showAppToast } from "@/lib/toast/app-toast";

export function InfluencerPromptDialog() {
  const router = useRouter();
  const { data: status } = useInfluencerStatus();
  const { startChallenge, skipModal, markModalShown } = useInfluencerMutations();
  const [open, setOpen] = useState(false);
  const markedRef = useRef(false);

  useEffect(() => {
    if (
      !status?.featureEnabled ||
      status.hasInfluencerBadge ||
      !status.shouldShowModal
    ) {
      setOpen(false);
      return;
    }
    setOpen(true);
    if (!markedRef.current) {
      markedRef.current = true;
      void markModalShown.mutateAsync().catch(() => undefined);
    }
  }, [status, markModalShown]);

  const headline = status?.modalHeadline ?? "Earn the Influencer Badge";
  const body = status?.modalBody ?? INFLUENCER_CHALLENGE_SHORT;

  async function onStart() {
    try {
      await startChallenge.mutateAsync(false);
      setOpen(false);
      showAppToast.success(
        "Challenge started",
        "Create a video post to begin counting toward your badge."
      );
      router.push("/create");
    } catch (error) {
      showAppToast.fromError(error, "Could not start challenge");
    }
  }

  async function onSkip() {
    setOpen(false);
    try {
      await skipModal.mutateAsync();
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
          <Button type="button" variant="ghost" onClick={() => void onSkip()}>
            Not now
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
