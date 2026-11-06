"use client";

import { AlertTriangle, Info } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { AccountDeletionConfirmationDialog } from "@/components/settings/account-deletion-confirmation-dialog";
import { AccountDeletionPreviewDialog } from "@/components/settings/account-deletion-preview-dialog";
import { useConfirm } from "@/components/common/confirm-provider";
import { Button } from "@/components/ui/button";
import { SettingsAccountSkeleton } from "@/components/settings/settings-detail-skeleton";
import { InlineLoader } from "@/components/states/inline-loader";
import { fetchOwnProfileRequest } from "@/features/profile/services/profile.client";
import { getDeletionRequestMeta } from "@/features/settings/lib/deletion-request-meta";
import { useAccountDeletion } from "@/features/settings/hooks/use-account-deletion";

export function AccountSettingsScreen() {
  const { confirm } = useConfirm();
  const profileQuery = useQuery({
    queryKey: ["profile", "me"],
    queryFn: ({ signal }) => fetchOwnProfileRequest(signal),
    select: (data) => data.profile,
  });

  const profile = profileQuery.data;
  const userEmail = profile?.email;
  const hasPendingDeletion = profile?.deletionRequestPending === true;
  const deletionMeta = getDeletionRequestMeta(
    profile?.deletionRequestedAt ?? null
  );

  const {
    loading,
    previewData,
    showPreviewModal,
    showConfirmationModal,
    deletionType,
    apiError,
    fetchDeletionPreview,
    initiateAccountDeletion,
    proceedFromPreview,
    handleFinalConfirmation,
    cancelAccountDeletion,
    closePreviewModal,
    closeConfirmationModal,
  } = useAccountDeletion(userEmail);

  const handleCancelDeletionPress = async () => {
    const ok = await confirm({
      title: "Cancel deletion request",
      description:
        "Are you sure you want to cancel your account deletion request? Your account will be reactivated and you will be able to use it normally.",
      confirmLabel: "Cancel deletion",
      variant: "default",
    });
    if (!ok) return;
    await cancelAccountDeletion();
  };

  if (profileQuery.isLoading) {
    return <SettingsAccountSkeleton />;
  }

  return (
    <div className="space-y-4">
      <section className="rounded-lg border border-border bg-card p-4">
        <h2 className="text-sm font-semibold">Account deletion</h2>
        <p className="mt-1 text-xs text-muted-foreground">
          Permanently delete your account and all associated data. This action
          cannot be undone.
        </p>

        {hasPendingDeletion ? (
          <div className="mt-4 space-y-3">
            <div className="rounded-lg border border-amber-200/80 bg-amber-50 p-3 dark:border-amber-900/50 dark:bg-amber-950/30">
              <div className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-amber-600" aria-hidden />
                <p className="text-sm font-semibold">Deletion request pending</p>
              </div>
              <p className="mt-2 text-xs text-muted-foreground">
                Your account deletion has been scheduled. Your account will be
                permanently deleted after the grace period ends.
              </p>
              {deletionMeta ? (
                <div className="mt-2 space-y-0.5 text-xs text-muted-foreground">
                  <p>
                    Requested on:{" "}
                    <span className="font-medium text-foreground">
                      {deletionMeta.requestedDate}
                    </span>
                  </p>
                  {deletionMeta.daysRemaining > 0 ? (
                    <p>
                      Days remaining:{" "}
                      <span className="font-medium text-foreground">
                        {deletionMeta.daysRemaining} days
                      </span>
                    </p>
                  ) : null}
                </div>
              ) : null}
            </div>
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={loading}
              onClick={() => void handleCancelDeletionPress()}
            >
              {loading ? (
                <span className="inline-flex items-center gap-2">
                  <InlineLoader className="h-4 w-4" />
                  Cancelling…
                </span>
              ) : (
                "Cancel deletion request"
              )}
            </Button>
          </div>
        ) : (
          <>
            <ul className="mt-3 space-y-1.5 text-xs text-muted-foreground">
              {[
                "All posts, comments, and likes will be removed",
                "Connections and messages will be deleted",
                "Profile and all personal data will be erased",
                "Option for 7-day grace period available",
              ].map((line) => (
                <li key={line} className="flex gap-2">
                  <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-muted-foreground" />
                  {line}
                </li>
              ))}
            </ul>

            <div className="mt-4 space-y-2">
              <button
                type="button"
                disabled={loading}
                onClick={() => void fetchDeletionPreview()}
                className="flex w-full items-center gap-3 rounded-lg border border-destructive/30 bg-destructive/5 p-3 locale-text text-start transition-colors hover:bg-destructive/10 disabled:opacity-50"
              >
                <AlertTriangle
                  className="h-5 w-5 shrink-0 text-destructive"
                  aria-hidden
                />
                <span className="min-w-0 flex-1">
                  <span className="block text-sm font-semibold text-destructive">
                    Delete immediately
                  </span>
                  <span className="mt-0.5 block text-xs text-muted-foreground">
                    Permanently delete your account right away
                  </span>
                </span>
                {loading && showPreviewModal && !previewData ? (
                  <InlineLoader className="h-5 w-5 shrink-0 text-destructive" />
                ) : null}
              </button>

              <button
                type="button"
                disabled={loading}
                onClick={() => void initiateAccountDeletion("grace_period")}
                className="flex w-full items-start gap-3 rounded-lg border border-border bg-muted/20 p-3 locale-text text-start transition-colors hover:bg-muted/40 disabled:opacity-50"
              >
                <AlertTriangle
                  className="mt-0.5 h-5 w-5 shrink-0 text-amber-600"
                  aria-hidden
                />
                <span>
                  <span className="block text-sm font-semibold">
                    Schedule for later (7 days)
                  </span>
                  <span className="mt-0.5 block text-xs text-muted-foreground">
                    Mark for deletion after 7 days
                  </span>
                </span>
              </button>
            </div>
          </>
        )}
      </section>

      <div className="flex gap-2 rounded-lg border border-border bg-muted/20 p-3 text-xs text-muted-foreground">
        <Info className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />
        <p>
          Need help? Contact our support team before deleting your account.
          We&apos;re here to assist you.
        </p>
      </div>

      <AccountDeletionPreviewDialog
        open={showPreviewModal}
        preview={previewData}
        loading={loading}
        onClose={() => closePreviewModal()}
        onProceed={proceedFromPreview}
      />

      <AccountDeletionConfirmationDialog
        open={showConfirmationModal}
        deletionType={deletionType}
        loading={loading}
        userEmail={userEmail}
        apiError={apiError}
        onClose={closeConfirmationModal}
        onConfirm={(email) => void handleFinalConfirmation(email)}
      />
    </div>
  );
}
