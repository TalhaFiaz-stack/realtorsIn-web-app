"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import {
  cancelDeletionRequestRequest,
  deleteAccountRequest,
  fetchDeletionPreviewRequest,
  requestDeletionGracePeriodRequest,
} from "@/features/settings/services/settings.client";
import { logoutRequest } from "@/features/auth/services/auth.client";
import type { AccountDeletionPreview } from "@/features/settings/types/settings.types";
import { showAppToast } from "@/lib/toast/app-toast";

export type AccountDeletionType = "immediate" | "grace_period";

export function useAccountDeletion(userEmail: string | null | undefined) {
  const router = useRouter();
  const queryClient = useQueryClient();

  const [loading, setLoading] = useState(false);
  const [previewData, setPreviewData] = useState<AccountDeletionPreview | null>(
    null
  );
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [showConfirmationModal, setShowConfirmationModal] = useState(false);
  const [deletionType, setDeletionType] =
    useState<AccountDeletionType>("immediate");
  const [apiError, setApiError] = useState("");

  useEffect(() => {
    if (showPreviewModal && showConfirmationModal) {
      setShowPreviewModal(false);
    }
  }, [showPreviewModal, showConfirmationModal]);

  const invalidateProfile = useCallback(() => {
    void queryClient.invalidateQueries({ queryKey: ["profile", "me"] });
  }, [queryClient]);

  const fetchDeletionPreview = useCallback(async () => {
    setApiError("");
    setLoading(true);
    setShowConfirmationModal(false);
    setShowPreviewModal(true);
    try {
      const response = await fetchDeletionPreviewRequest();
      setPreviewData(response.preview);
    } catch (error) {
      setShowPreviewModal(false);
      setPreviewData(null);
      showAppToast.fromError(
        error,
        "Failed to fetch deletion preview"
      );
    } finally {
      setLoading(false);
    }
  }, []);

  const closePreviewModal = useCallback((clearData = true) => {
    setLoading(false);
    if (clearData) {
      setPreviewData(null);
    }
    setShowConfirmationModal(false);
    setShowPreviewModal(false);
  }, []);

  const closeConfirmationModal = useCallback(() => {
    setLoading(false);
    setShowPreviewModal(false);
    setShowConfirmationModal(false);
    setApiError("");
  }, []);

  const initiateAccountDeletion = useCallback(
    async (type: AccountDeletionType) => {
      setDeletionType(type);
      setApiError("");

      if (type === "grace_period") {
        setShowPreviewModal(false);
        setShowConfirmationModal(true);
        return;
      }

      if (previewData) {
        setShowPreviewModal(false);
        window.setTimeout(() => setShowConfirmationModal(true), 200);
      } else {
        await fetchDeletionPreview();
      }
    },
    [previewData, fetchDeletionPreview]
  );

  const proceedFromPreview = useCallback(() => {
    closePreviewModal(false);
    window.setTimeout(() => {
      void initiateAccountDeletion("immediate");
    }, 300);
  }, [closePreviewModal, initiateAccountDeletion]);

  const executeAccountDeletion = useCallback(async () => {
    setApiError("");
    setLoading(true);
    try {
      const response = await deleteAccountRequest();
      closeConfirmationModal();
      showAppToast.success(
        "Account deleted",
        response.message ||
          "Your account has been permanently deleted. All your data has been removed from our servers."
      );
      try {
        await logoutRequest();
      } finally {
        router.replace("/login");
        router.refresh();
      }
      return { success: true as const };
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Failed to delete account";
      setApiError(message);
      return { success: false as const, error: message };
    } finally {
      setLoading(false);
    }
  }, [closeConfirmationModal, router]);

  const requestAccountDeletion = useCallback(async () => {
    setApiError("");
    setLoading(true);
    try {
      const response = await requestDeletionGracePeriodRequest();
      closeConfirmationModal();
      invalidateProfile();
      showAppToast.success(
        "Deletion scheduled",
        response.message ||
          "Your account has been scheduled for deletion. You can cancel this request by logging in again within the next 7 days."
      );
      return { success: true as const };
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Failed to schedule account deletion";
      setApiError(message);
      return { success: false as const, error: message };
    } finally {
      setLoading(false);
    }
  }, [closeConfirmationModal, invalidateProfile]);

  const cancelAccountDeletion = useCallback(async () => {
    setLoading(true);
    try {
      const response = await cancelDeletionRequestRequest();
      invalidateProfile();
      showAppToast.success(
        "Deletion cancelled",
        response.message || "Your account has been reactivated successfully."
      );
      return { success: true as const };
    } catch (error) {
      showAppToast.fromError(error, "Failed to cancel deletion");
      return { success: false as const };
    } finally {
      setLoading(false);
    }
  }, [invalidateProfile]);

  const handleFinalConfirmation = useCallback(
    async (emailConfirmation: string | null) => {
      if (deletionType === "immediate") {
        const entered = emailConfirmation?.trim().toLowerCase() ?? "";
        const expected = userEmail?.trim().toLowerCase() ?? "";
        if (!entered) {
          setApiError("Please enter your email address");
          return;
        }
        if (!expected || entered !== expected) {
          setApiError(
            "Email does not match. Please enter your registered email address."
          );
          return;
        }
        await executeAccountDeletion();
        return;
      }
      await requestAccountDeletion();
    },
    [
      deletionType,
      userEmail,
      executeAccountDeletion,
      requestAccountDeletion,
    ]
  );

  return {
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
  };
}
