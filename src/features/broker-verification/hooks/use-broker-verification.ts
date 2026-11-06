"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  fetchBrokerVerificationStatusRequest,
  submitBrokerVerificationRequest,
} from "@/features/broker-verification/services/broker-verification.client";
import { ownProfileQueryKey } from "@/features/profile/hooks/use-profile";
import { showAppToast } from "@/lib/toast/app-toast";
import { defaultToastDescription } from "@/lib/toast/toast-default-description";

export const brokerVerificationStatusQueryKey = ["broker-verification", "status"] as const;

export function useBrokerVerificationStatus(enabled = true) {
  return useQuery({
    queryKey: brokerVerificationStatusQueryKey,
    queryFn: ({ signal }) => fetchBrokerVerificationStatusRequest(signal),
    select: (data) => data.status,
    enabled,
  });
}

export function useBrokerVerificationSubmit() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: submitBrokerVerificationRequest,
    onSuccess: (data) => {
      void queryClient.invalidateQueries({ queryKey: ownProfileQueryKey });
      void queryClient.invalidateQueries({
        queryKey: brokerVerificationStatusQueryKey,
      });
      const title = "Verification submitted";
      showAppToast.success(
        title,
        data.message?.trim() || defaultToastDescription("success", title)
      );
    },
    onError: (error) => {
      showAppToast.fromError(error, "Could not submit verification");
    },
  });
}
