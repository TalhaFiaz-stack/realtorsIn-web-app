"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Copy, ExternalLink } from "lucide-react";
import { useState } from "react";

type Props = {
  open: boolean;
  url: string | null;
  onOpenChange: (open: boolean) => void;
};

export function OffPlanOfferPreviewDialog({ open, url, onOpenChange }: Props) {
  const [copied, setCopied] = useState(false);

  const copyLink = async () => {
    if (!url) return;
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Project offer presentation</DialogTitle>
        </DialogHeader>
        {url ? (
          <div className="space-y-3">
            <div className="flex flex-wrap gap-2">
              <Button type="button" variant="outline" size="sm" onClick={copyLink}>
                <Copy className="me-2 h-4 w-4" aria-hidden />
                {copied ? "Copied" : "Copy link"}
              </Button>
              <Button type="button" size="sm" asChild>
                <a href={url} target="_blank" rel="noreferrer">
                  <ExternalLink className="me-2 h-4 w-4" aria-hidden />
                  Open in new tab
                </a>
              </Button>
            </div>
            <iframe
              title="Offer presentation"
              src={url}
              className="h-[min(70vh,520px)] w-full rounded-md border border-border bg-muted"
            />
          </div>
        ) : null}
      </DialogContent>
    </Dialog>
  );
}
