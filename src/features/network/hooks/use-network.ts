"use client";

import {
  useMutation,
  useQuery,
  useQueryClient,
  type QueryClient,
} from "@tanstack/react-query";
import {
  acceptRequest,
  fetchConnections,
  fetchMutualConnectionsRequest,
  fetchSuggestions,
  rejectRequest,
  removeConnectionRequest,
  sendRequest,
  withdrawRequest,
} from "@/features/network/services/network.client";
import type { NetworkListType } from "@/features/network/types/network.types";
import { ApiError } from "@/lib/api/errors";
import { showAppToast } from "@/lib/toast/app-toast";

export type NetworkAction =
  | "accept"
  | "reject"
  | "withdraw"
  | "remove"
  | "send";

export type NetworkMutationInput = {
  action: NetworkAction;
  connectionId?: number;
  userId?: number;
  /** Caller removes the row first, then shows toast (suggestion cards). */
  deferSuccessToast?: boolean;
};

const NETWORK_SUCCESS_COPY: Record<
  NetworkAction,
  { title: string; description: string }
> = {
  send: {
    title: "Connection request sent",
    description: "They’ll be notified and can accept from their network tab.",
  },
  accept: {
    title: "Connection accepted",
    description: "You can message each other from Messaging.",
  },
  reject: {
    title: "Request declined",
    description: "They won’t be added to your network.",
  },
  withdraw: {
    title: "Request withdrawn",
    description: "You can send a new request later if you change your mind.",
  },
  remove: {
    title: "Connection removed",
    description: "You can connect again from their profile or search.",
  },
};

export function useMutualConnections(input: {
  remUserId?: number;
  socialProfileId?: number;
}) {
  const enabled =
    (input.remUserId != null && input.remUserId > 0) ||
    (input.socialProfileId != null && input.socialProfileId > 0);

  return useQuery({
    queryKey: [
      "network",
      "mutual",
      input.remUserId ?? 0,
      input.socialProfileId ?? 0,
    ] as const,
    enabled,
    queryFn: ({ signal }) =>
      fetchMutualConnectionsRequest({ ...input, signal }),
  });
}

export function useNetworkList(tab: NetworkListType | "suggestions") {
  return useQuery({
    queryKey:
      tab === "suggestions"
        ? (["network", "suggestions"] as const)
        : (["network", "list", tab] as const),
    queryFn: ({ signal }) =>
      tab === "suggestions"
        ? fetchSuggestions(1, signal)
        : fetchConnections({ type: tab, page: 1, signal }),
  });
}

export function useNetworkActions() {
  const queryClient = useQueryClient();
  const invalidate = () => {
    void queryClient.invalidateQueries({ queryKey: ["network"] });
  };

  return useMutation({
    mutationFn: async (input: NetworkMutationInput) => {
      if (input.action === "send" && input.userId) {
        return sendRequest(input.userId);
      }
      if (!input.connectionId) throw new Error("Missing connection id");
      if (input.action === "accept") return acceptRequest(input.connectionId);
      if (input.action === "reject") return rejectRequest(input.connectionId);
      if (input.action === "withdraw")
        return withdrawRequest(input.connectionId);
      return removeConnectionRequest(input.connectionId);
    },
    onSuccess: (_data, variables) => {
      if (variables.deferSuccessToast) {
        return;
      }
      invalidate();
      const copy = NETWORK_SUCCESS_COPY[variables.action];
      showAppToast.success(copy.title, copy.description);
    },
    onError: (error) => {
      showAppToast.fromError(error, "Network action failed");
    },
  });
}

/** Stable pending key for per-row disable (userId or connectionId). */
export function networkPendingKey(input: {
  action: NetworkAction;
  connectionId?: number;
  userId?: number;
}): string | null {
  if (input.action === "send" && input.userId) return `send:${input.userId}`;
  if (input.connectionId) return `${input.action}:${input.connectionId}`;
  return null;
}

/** Hide suggestion row, refresh network, then toast (defer path skips global onSuccess). */
export function connectSuggestionWithDismiss(options: {
  mutate: ReturnType<typeof useNetworkActions>;
  queryClient: QueryClient;
  userId: number;
  onDismiss: (userId: number) => void;
}) {
  const { mutate, queryClient, userId, onDismiss } = options;
  mutate.mutate(
    { action: "send", userId, deferSuccessToast: true },
    {
      onSuccess: () => {
        onDismiss(userId);
        void queryClient.invalidateQueries({ queryKey: ["network"] });
        requestAnimationFrame(() => {
          showAppToast.success(
            NETWORK_SUCCESS_COPY.send.title,
            NETWORK_SUCCESS_COPY.send.description
          );
        });
      },
    }
  );
}

export function networkErrorMessage(error: unknown): string {
  if (error instanceof ApiError) return error.message;
  if (error instanceof Error) return error.message;
  return "Something went wrong";
}
