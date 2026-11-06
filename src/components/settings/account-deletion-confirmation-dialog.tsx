"use client";

import { useEffect, useState } from "react";
import { AlertTriangle } from "lucide-react";
import type { AccountDeletionType } from "@/features/settings/hooks/use-account-deletion";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { InlineLoader } from "@/components/states/inline-loader";
import { cn } from "@/lib/utils";

type Props = {
  open: boolean;
  deletionType: AccountDeletionType;
  loading?: boolean;
  userEmail?: string | null;
  apiError?: string;
  onClose: () => void;
  onConfirm: (emailConfirmation: string | null) => void;
};

function InfoList({ immediate }: { immediate: boolean }) {
  const items = immediate
    ? [
        "All your posts, comments, and likes will be deleted",
        "All connections and messages will be removed",
        "Your profile will be permanently deleted",
        "You will be immediately logged out",
      ]
    : [
        "Your account will be marked as inactive",
        "You have 7 days to cancel this request",
        "After 7 days, all data will be permanently deleted",
        "You will be logged out after confirmation",
      ];

  return (
    <ul className="space-y-2 rounded-lg border border-border bg-muted/30 p-3 text-sm">
      <li className="font-semibold">What will happen:</li>
      {items.map((text) => (
        <li key={text} className="flex gap-2 text-muted-foreground">
          <span className="font-bold text-destructive">•</span>
          <span>{text}</span>
        </li>
      ))}
    </ul>
  );
}

export function AccountDeletionConfirmationDialog({
  open,
  deletionType,
  loading,
  userEmail,
  apiError,
  onClose,
  onConfirm,
}: Props) {
  const isImmediate = deletionType === "immediate";
  const [confirmationText, setConfirmationText] = useState("");
  const [validationError, setValidationError] = useState("");

  useEffect(() => {
    if (!open) {
      setConfirmationText("");
      setValidationError("");
    }
  }, [open]);

  useEffect(() => {
    if (
      apiError &&
      apiError !== "Please enter your email address" &&
      !apiError.includes("Email does not match")
    ) {
      setValidationError("");
    }
  }, [apiError]);

  const displayError =
    validationError ||
    (apiError &&
    (apiError === "Please enter your email address" ||
      apiError.includes("Email does not match"))
      ? apiError
      : "") ||
    "";

  const handleConfirm = () => {
    if (isImmediate) {
      const entered = confirmationText.trim().toLowerCase();
      const expected = userEmail?.trim().toLowerCase() ?? "";
      if (!entered) {
        setValidationError("Please enter your email address");
        return;
      }
      if (!expected || entered !== expected) {
        setValidationError(
          "Email does not match. Please enter your registered email address."
        );
        return;
      }
    }
    setValidationError("");
    onConfirm(isImmediate ? confirmationText : null);
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        if (!next && !loading) onClose();
      }}
    >
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-md">
        <DialogHeader className="text-center">
          <div className="mx-auto mb-2 flex h-14 w-14 items-center justify-center">
            <AlertTriangle className="h-10 w-10 text-amber-500" aria-hidden />
          </div>
          <DialogTitle>
            {isImmediate
              ? "Delete account permanently?"
              : "Schedule account deletion?"}
          </DialogTitle>
          <p className="text-sm text-muted-foreground">
            {isImmediate
              ? "This action cannot be undone. Your account and all associated data will be permanently deleted from our servers immediately."
              : "Your account will be marked as inactive and scheduled for permanent deletion in 7 days. You can cancel this request by logging in again before the grace period ends."}
          </p>
        </DialogHeader>

        <div className="space-y-4">
          <InfoList immediate={isImmediate} />

          {isImmediate ? (
            <div className="space-y-2">
              <p className="text-center text-sm font-medium">
                Enter your email address to confirm:
              </p>
              <Input
                type="email"
                autoComplete="email"
                value={confirmationText}
                disabled={loading}
                placeholder="Enter your email address"
                className={cn(displayError && "border-destructive")}
                onChange={(e) => {
                  setConfirmationText(e.target.value);
                  if (validationError) setValidationError("");
                }}
              />
              {displayError ? (
                <p className="text-center text-xs text-destructive">
                  {displayError}
                </p>
              ) : null}
            </div>
          ) : null}

          {apiError &&
          apiError !== "Please enter your email address" &&
          !apiError.includes("Email does not match") ? (
            <div className="rounded-md border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm text-destructive">
              {apiError}
            </div>
          ) : null}

          <div className="flex gap-2 rounded-md border border-amber-200/80 bg-amber-50 px-3 py-2 text-xs text-amber-900 dark:border-amber-900/50 dark:bg-amber-950/30 dark:text-amber-200">
            <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />
            <p>
              {isImmediate
                ? "Warning: This is a permanent action and cannot be reversed."
                : "Note: You can cancel this request by logging in again within 7 days."}
            </p>
          </div>
        </div>

        <DialogFooter className="gap-2 sm:justify-stretch">
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
            disabled={loading || (isImmediate && !confirmationText.trim())}
            onClick={handleConfirm}
          >
            {loading ? (
              <span className="inline-flex items-center gap-2">
                <InlineLoader className="h-4 w-4" />
                Processing…
              </span>
            ) : isImmediate ? (
              "Delete now"
            ) : (
              "Schedule deletion"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
