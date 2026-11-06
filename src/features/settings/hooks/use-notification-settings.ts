"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  batchNotificationSettingsRequest,
  fetchNotificationSettingsRequest,
  patchNotificationSettingRequest,
} from "@/features/settings/services/settings.client";
import type { NotificationSettingItem } from "@/features/settings/types/settings.types";
import { showAppToast } from "@/lib/toast/app-toast";
import { ApiError } from "@/lib/api/errors";

const QUERY_KEY = ["settings", "notification-settings"] as const;

export function useNotificationSettingsQuery() {
  return useQuery({
    queryKey: QUERY_KEY,
    queryFn: ({ signal }) => fetchNotificationSettingsRequest(signal),
    select: (data) => data.settings,
  });
}

export function useNotificationSettingsMutations() {
  const queryClient = useQueryClient();

  const applySettings = (settings: NotificationSettingItem[]) => {
    queryClient.setQueryData(QUERY_KEY, { ok: true as const, settings });
  };

  const patchOne = useMutation({
    mutationFn: patchNotificationSettingRequest,
    onMutate: async (input) => {
      await queryClient.cancelQueries({ queryKey: QUERY_KEY });
      const previous = queryClient.getQueryData<{
        ok: true;
        settings: NotificationSettingItem[];
      }>(QUERY_KEY);
      if (previous?.settings) {
        applySettings(
          previous.settings.map((row) =>
            row.key === input.key ? { ...row, value: input.value } : row
          )
        );
      }
      return { previous };
    },
    onSuccess: (data) => {
      applySettings(data.settings);
    },
    onError: (error, _input, context) => {
      if (context?.previous) {
        queryClient.setQueryData(QUERY_KEY, context.previous);
      }
      showAppToast.fromError(error, "Could not update setting");
    },
  });

  const patchBatch = useMutation({
    mutationFn: batchNotificationSettingsRequest,
    onMutate: async (settings) => {
      await queryClient.cancelQueries({ queryKey: QUERY_KEY });
      const previous = queryClient.getQueryData<{
        ok: true;
        settings: NotificationSettingItem[];
      }>(QUERY_KEY);
      if (previous?.settings) {
        const valueByKey = Object.fromEntries(
          settings.map((s) => [s.key, s.value])
        );
        applySettings(
          previous.settings.map((row) =>
            Object.prototype.hasOwnProperty.call(valueByKey, row.key)
              ? { ...row, value: valueByKey[row.key] }
              : row
          )
        );
      }
      return { previous };
    },
    onSuccess: (data) => {
      applySettings(data.settings);
    },
    onError: (error, _input, context) => {
      if (context?.previous) {
        queryClient.setQueryData(QUERY_KEY, context.previous);
      }
      showAppToast.fromError(error, "Could not update settings");
    },
  });

  return { patchOne, patchBatch };
}

export function notificationSettingsErrorMessage(error: unknown) {
  if (error instanceof ApiError) return error.message;
  if (error instanceof Error) return error.message;
  return "Something went wrong";
}
