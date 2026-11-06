"use client";

import Link from "next/link";
import { ExternalLink } from "lucide-react";
import { EventDetailPanel } from "@/components/events/event-detail-panel";
import { EventDetailQuickActions } from "@/components/events/event-detail-quick-actions";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog";

export function EventDetailDialog({
  eventId,
  open,
  onOpenChange,
}: {
  eventId: number;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  previewTitle?: string | null;
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        showCloseButton
        className="flex max-h-[min(90vh,720px)] w-[calc(100%-2rem)] max-w-[22.5rem] flex-col gap-0 overflow-hidden rounded-xl border border-border/90 bg-card p-0 shadow-xl sm:max-w-md [&>button]:end-3 [&>button]:top-3 [&>button]:rounded-full [&>button]:border [&>button]:border-white/20 [&>button]:bg-black/45 [&>button]:p-1.5 [&>button]:text-white [&>button]:opacity-100 [&>button]:hover:bg-black/55 [&>button_svg]:h-4 [&>button_svg]:w-4"
      >
        <DialogTitle className="sr-only">Event details</DialogTitle>
        <DialogDescription className="sr-only">
          View event information and register
        </DialogDescription>

        <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain">
          {open ? (
            <EventDetailPanel
              eventId={eventId}
              titleAs="h2"
              variant="embedded"
            />
          ) : null}
        </div>

        <div className="shrink-0 space-y-2.5 border-t border-border bg-card px-4 py-3.5">
          <EventDetailQuickActions eventId={eventId} active={open} />
          <p className="text-center">
            <Link
              href={`/events/${eventId}`}
              onClick={() => onOpenChange(false)}
              className="inline-flex items-center gap-1 text-xs font-medium text-muted-foreground transition-colors hover:text-primary"
            >
              View full event page
              <ExternalLink className="h-3 w-3" aria-hidden />
            </Link>
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
