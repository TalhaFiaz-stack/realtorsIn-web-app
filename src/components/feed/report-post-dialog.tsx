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
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import { InlineLoader } from "@/components/states/inline-loader";
import {
  fetchReportReasonsRequest,
  reportPostRequest,
} from "@/features/feed/services/posts.client";
import type { ReportReason } from "@/features/feed/types/post.types";
import { ApiError } from "@/lib/api/errors";
import { showAppToast } from "@/lib/toast/app-toast";

function ReportReasonsShimmer() {
  return (
    <div className="space-y-3" aria-busy="true" aria-label="Loading reasons">
      <div className="space-y-2">
        <Skeleton className="h-4 w-16" />
        <Skeleton className="h-10 w-full rounded-lg" />
      </div>
      <Skeleton className="h-3 w-3/4" />
      <Skeleton className="h-3 w-1/2" />
    </div>
  );
}

export function ReportPostDialog({
  postId,
  open,
  onOpenChange,
}: {
  postId: number | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const [reasons, setReasons] = useState<ReportReason[]>([]);
  const [reason, setReason] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  useEffect(() => {
    if (!open) {
      setLoading(false);
      return;
    }
    let cancelled = false;
    setError(null);
    setDone(false);
    setReason("");
    setMessage("");
    setReasons([]);
    setLoading(true);
    fetchReportReasonsRequest()
      .then((list) => {
        if (!cancelled) setReasons(list);
      })
      .catch((err) => {
        if (cancelled) return;
        setError(
          err instanceof ApiError ? err.message : "Unable to load reasons"
        );
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [open]);

  async function submit() {
    if (!postId || !reason) return;
    setPending(true);
    setError(null);
    try {
      await reportPostRequest({
        postId,
        reportReason: reason,
        reportMessage: reason === "Other" ? message : undefined,
      });
      setDone(true);
      showAppToast.success("Report submitted", "Thanks for helping keep the network safe.");
    } catch (err) {
      const message = err instanceof ApiError ? err.message : "Report failed";
      setError(message);
      showAppToast.error("Report failed", message);
    } finally {
      setPending(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Report post</DialogTitle>
          <DialogDescription>
            Your report is anonymous. Choose a reason to help keep the network
            safe.
          </DialogDescription>
        </DialogHeader>

        {loading ? (
          <ReportReasonsShimmer />
        ) : done ? (
          <p className="py-4 text-sm text-muted-foreground">
            Thanks — we received your report.
          </p>
        ) : (
          <div className="space-y-3">
            <div className="space-y-2">
              <Label htmlFor="report-reason">Reason</Label>
              <select
                id="report-reason"
                className="flex h-10 w-full rounded-lg border border-input bg-card px-3 text-sm"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
              >
                <option value="">Select a reason</option>
                {reasons.map((item) => (
                  <option key={item.key} value={item.key}>
                    {item.title}
                  </option>
                ))}
              </select>
            </div>
            {reason === "Other" ? (
              <div className="space-y-2">
                <Label htmlFor="report-message">Details</Label>
                <Textarea
                  id="report-message"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Tell us more"
                  rows={3}
                />
              </div>
            ) : null}
            {error ? (
              <p className="text-sm text-destructive">{error}</p>
            ) : null}
          </div>
        )}

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Close
          </Button>
          {!done ? (
            <Button
              onClick={submit}
              disabled={
                pending ||
                !reason ||
                (reason === "Other" && message.trim().length === 0)
              }
            >
              {pending ? <InlineLoader /> : null}
              Submit report
            </Button>
          ) : null}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
