"use client";

import { AlertTriangle } from "lucide-react";
import { ACCOUNT_DELETION_PREVIEW_CATEGORIES } from "@/features/settings/constants/account-deletion-preview-categories";
import type { AccountDeletionPreview } from "@/features/settings/types/settings.types";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { InlineLoader } from "@/components/states/inline-loader";
import { cn } from "@/lib/utils";

const CATEGORY_ACCENTS = [
  "border-blue-200 bg-blue-50 text-blue-800 dark:border-blue-900/50 dark:bg-blue-950/40 dark:text-blue-200",
  "border-emerald-200 bg-emerald-50 text-emerald-800 dark:border-emerald-900/50 dark:bg-emerald-950/40 dark:text-emerald-200",
  "border-amber-200 bg-amber-50 text-amber-900 dark:border-amber-900/50 dark:bg-amber-950/40 dark:text-amber-200",
  "border-violet-200 bg-violet-50 text-violet-900 dark:border-violet-900/50 dark:bg-violet-950/40 dark:text-violet-200",
];

type Props = {
  open: boolean;
  preview: AccountDeletionPreview | null;
  loading?: boolean;
  onClose: () => void;
  onProceed: () => void;
};

function PreviewSkeleton() {
  return (
    <div className="space-y-3 px-5 py-4">
      <Skeleton className="h-24 w-full rounded-lg" />
      <Skeleton className="h-12 w-full rounded-md" />
      <Skeleton className="h-20 w-full rounded-lg" />
      <Skeleton className="h-16 w-full rounded-lg" />
    </div>
  );
}

export function AccountDeletionPreviewDialog({
  open,
  preview,
  loading,
  onClose,
  onProceed,
}: Props) {
  const showSkeleton = loading && !preview;
  const canRenderContent = Boolean(preview);

  if (!open) return null;

  const counts = preview?.dataToBeDeleted ?? {};
  const totalItems = Object.values(counts).reduce(
    (sum, n) => sum + (typeof n === "number" ? n : 0),
    0
  );

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        if (!next && !loading) onClose();
      }}
    >
      <DialogContent className="flex max-h-[90vh] flex-col gap-0 overflow-hidden p-0 sm:max-w-md">
        <DialogHeader className="space-y-2 border-b border-border px-5 py-4 text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-amber-500/15">
            <AlertTriangle className="h-6 w-6 text-amber-600" aria-hidden />
          </div>
          <DialogTitle>Account deletion preview</DialogTitle>
          <p className="text-sm text-muted-foreground">
            {showSkeleton
              ? "Loading what will be deleted…"
              : "Review what will be permanently deleted"}
          </p>
        </DialogHeader>

        {showSkeleton ? (
          <PreviewSkeleton />
        ) : canRenderContent && preview ? (
          <div className="max-h-[50vh] space-y-3 overflow-y-auto px-5 py-4">
            <div className="rounded-lg border border-border bg-muted/30 p-3">
              <p className="text-[11px] font-bold uppercase tracking-wide text-muted-foreground">
                Account details
              </p>
              <dl className="mt-2 space-y-1 text-sm">
                <div className="flex justify-between gap-2">
                  <dt className="text-muted-foreground">Name</dt>
                  <dd className="font-medium">{preview.user.name || "N/A"}</dd>
                </div>
                <div className="flex justify-between gap-2">
                  <dt className="text-muted-foreground">Email</dt>
                  <dd className="truncate font-medium">
                    {preview.user.email || "N/A"}
                  </dd>
                </div>
              </dl>
            </div>

            <div className="flex items-center justify-between rounded-md border border-destructive/30 bg-destructive/5 px-3 py-2">
              <span className="text-sm font-semibold text-destructive">
                Total items to be deleted
              </span>
              <span className="text-2xl font-extrabold text-destructive">
                {totalItems}
              </span>
            </div>

            {ACCOUNT_DELETION_PREVIEW_CATEGORIES.map((category, index) => {
              const items = category.items.filter(
                (item) => (counts[item.key] ?? 0) > 0
              );
              if (items.length === 0) return null;
              return (
                <div key={category.title}>
                  <p className="mb-1.5 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                    {category.title}
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {items.map((item) => (
                      <div
                        key={item.key}
                        className={cn(
                          "min-w-[4.5rem] rounded-lg border px-2.5 py-1.5",
                          CATEGORY_ACCENTS[index % CATEGORY_ACCENTS.length]
                        )}
                      >
                        <p className="text-[11px] opacity-80">{item.label}</p>
                        <p className="text-base font-bold">{counts[item.key]}</p>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}

            <div className="flex gap-2 rounded-md border border-amber-200/80 bg-amber-50 px-3 py-2 text-xs text-amber-900 dark:border-amber-900/50 dark:bg-amber-950/30 dark:text-amber-200">
              <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />
              <p>
                This action cannot be undone. All your data will be permanently
                deleted from our servers.
              </p>
            </div>
          </div>
        ) : null}

        <DialogFooter className="gap-2 border-t border-border bg-muted/20 px-5 py-4 sm:justify-stretch">
          <Button
            type="button"
            variant="outline"
            className="flex-1"
            disabled={loading}
            onClick={onClose}
          >
            Cancel
          </Button>
          <Button
            type="button"
            variant="destructive"
            className="flex-1"
            disabled={loading || !preview}
            onClick={onProceed}
          >
            {loading ? (
              <span className="inline-flex items-center gap-2">
                <InlineLoader className="h-4 w-4" />
                Processing…
              </span>
            ) : (
              "Proceed to delete"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
