"use client";

import { useEffect, useMemo, useRef } from "react";
import { useRouter } from "next/navigation";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { ErrorState } from "@/components/states/error-state";
import {
  CAMPAIGN_LINK_MESSAGE,
  buildCampaignSrcDoc,
  classifyCampaignLink,
} from "@/features/campaigns/lib/build-campaign-srcdoc";
import { resolvePushPath } from "@/lib/push/resolve-push-path";

/** Web version of mobile `CampaignPreviewBTSheet`. */
export function CampaignDesignDialog({
  open,
  title,
  html,
  loading,
  error,
  onRetry,
  onClose,
}: {
  open: boolean;
  title: string;
  html: string | null;
  loading?: boolean;
  error?: boolean;
  onRetry?: () => void;
  onClose: () => void;
}) {
  const router = useRouter();
  const frameRef = useRef<HTMLIFrameElement | null>(null);
  const srcDoc = useMemo(() => (html ? buildCampaignSrcDoc(html) : ""), [html]);

  useEffect(() => {
    if (!open) return;
    const onMessage = (event: MessageEvent) => {
      if (event.source !== frameRef.current?.contentWindow) return;
      const data = event.data as { type?: string; url?: string } | null;
      if (data?.type !== CAMPAIGN_LINK_MESSAGE || typeof data.url !== "string") return;
      const action = classifyCampaignLink(data.url, window.location.origin, (url) => {
        const path = resolvePushPath({ deep_link: url });
        return path === "/notifications" ? null : path;
      });
      if (action.kind === "external") {
        window.open(action.url, "_blank", "noopener,noreferrer");
      } else if (action.kind === "internal") {
        onClose();
        router.push(action.path);
      }
    };
    window.addEventListener("message", onMessage);
    return () => window.removeEventListener("message", onMessage);
  }, [open, onClose, router]);

  return (
    <Dialog open={open} onOpenChange={(next) => !next && onClose()}>
      <DialogContent className="flex max-h-[min(90dvh,760px)] flex-col gap-0 overflow-hidden p-0 sm:max-w-lg">
        <DialogHeader className="sr-only">
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>Announcement from RealtorsIn</DialogDescription>
        </DialogHeader>
        {loading ? (
          <div className="space-y-3 p-6" aria-busy aria-label="Loading announcement">
            <Skeleton className="h-40 w-full rounded-lg" />
            <Skeleton className="h-5 w-2/3" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-5/6" />
            <Skeleton className="h-10 w-full rounded-lg" />
          </div>
        ) : error || !html ? (
          <div className="p-6">
            <ErrorState
              title="Unable to load this announcement"
              description="It may have been removed."
              onRetry={onRetry}
              className="border-none"
            />
          </div>
        ) : (
          <iframe
            ref={frameRef}
            title={title}
            srcDoc={srcDoc}
            // Opaque origin: campaign HTML cannot reach the app's cookies or DOM.
            sandbox="allow-scripts"
            referrerPolicy="no-referrer"
            className="h-[min(80dvh,700px)] w-full rounded-xl border-0 bg-white"
          />
        )}
      </DialogContent>
    </Dialog>
  );
}
