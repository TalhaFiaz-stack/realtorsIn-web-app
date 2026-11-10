"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Copy, Link2, Trash2, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { useEventMutations } from "@/features/events/hooks/use-event-mutations";
import { isEventCancelled } from "@/features/events/lib/format-event";
import type { SocialEvent } from "@/features/events/types/event.types";
import { useConfirm } from "@/components/common/confirm-provider";
import { CONFIRM_DELETE_EVENT } from "@/constants/confirm-copy";
import { showAppToast } from "@/lib/toast/app-toast";

export function EventHostPanel({ event }: { event: SocialEvent }) {
  const router = useRouter();
  const { confirm } = useConfirm();
  const { publish, cancel, remove } = useEventMutations(event.id);
  const [cancelOpen, setCancelOpen] = useState(false);
  const [cancelNote, setCancelNote] = useState("");
  const cancelled = isEventCancelled(event);

  async function onPublish() {
    try {
      await publish.mutateAsync();
      showAppToast.success("Submitted for publishing");
    } catch (error) {
      showAppToast.fromError(error, "Publish failed");
    }
  }

  async function onCancel() {
    try {
      await cancel.mutateAsync(cancelNote);
      setCancelOpen(false);
      showAppToast.success("Event cancelled");
    } catch (error) {
      showAppToast.fromError(error, "Cancel failed");
    }
  }

  async function onDelete() {
    const ok = await confirm({
      ...CONFIRM_DELETE_EVENT,
      detail: event.title,
    });
    if (!ok) return;
    try {
      await remove.mutateAsync();
      showAppToast.success("Event deleted");
      router.push("/events?tab=hosting");
    } catch (error) {
      showAppToast.fromError(error, "Delete failed");
    }
  }

  function copyLink() {
    const url = event.publicUrl || `${window.location.origin}/events/${event.id}`;
    void navigator.clipboard.writeText(url);
    showAppToast.success("Link copied");
  }

  return (
    <div className="rounded-xl border border-border bg-muted/20 p-4 space-y-3">
      <p className="text-sm font-semibold text-foreground">Host tools</p>
      <div className="flex flex-wrap gap-2">
        {!cancelled ? (
          <Button asChild variant="outline" size="sm">
            <Link href={`/events/${event.id}/edit`}>Edit</Link>
          </Button>
        ) : null}
        <Button asChild variant="outline" size="sm">
          <Link href={`/events/${event.id}/attendees`}>
            <Users className="mr-1.5 h-3.5 w-3.5" />
            Attendees
          </Link>
        </Button>
        {!cancelled ? (
          <Button asChild variant="outline" size="sm">
            <Link href={`/events/${event.id}/invite`}>
              <Link2 className="mr-1.5 h-3.5 w-3.5" />
              Invite
            </Link>
          </Button>
        ) : null}
        {!cancelled ? (
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={copyLink}
          >
            <Copy className="mr-1.5 h-3.5 w-3.5" />
            Copy link
          </Button>
        ) : null}
      </div>
      {event.status === "draft" && !cancelled ? (
        <Button
          type="button"
          size="sm"
          disabled={publish.isPending}
          onClick={() => void onPublish()}
        >
          Publish
        </Button>
      ) : null}
      {event.status === "published" && !cancelled ? (
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => setCancelOpen(true)}
        >
          Cancel event
        </Button>
      ) : null}
      <Button
        type="button"
        variant="ghost"
        size="sm"
        className="text-destructive hover:text-destructive"
        onClick={() => void onDelete()}
      >
        <Trash2 className="mr-1.5 h-3.5 w-3.5" />
        Delete
      </Button>

      <Dialog open={cancelOpen} onOpenChange={setCancelOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Cancel event</DialogTitle>
          </DialogHeader>
          <Textarea
            placeholder="Note to attendees (optional)"
            value={cancelNote}
            onChange={(e) => setCancelNote(e.target.value)}
            rows={3}
          />
          <DialogFooter>
            <Button variant="outline" onClick={() => setCancelOpen(false)}>
              Back
            </Button>
            <Button onClick={() => void onCancel()}>Confirm cancel</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
