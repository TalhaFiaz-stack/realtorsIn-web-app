"use client";

import { useRouter } from "next/navigation";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useConfirm } from "@/components/common/confirm-provider";
import { Button } from "@/components/ui/button";
import { CONFIRM_REMOVE_CONNECTION } from "@/constants/confirm-copy";
import { useStartConversation } from "@/features/chat/hooks/use-chat";
import { useNetworkActions } from "@/features/network/hooks/use-network";
import { fetchConnectionStatusRequest } from "@/features/network/services/network.client";
import type { SocialProfile } from "@/features/profile/types/profile.types";
import { ApiError } from "@/lib/api/errors";

function statusQueryKey(socialProfileId: number) {
  return ["network", "status", socialProfileId] as const;
}

export function ProfileConnectionActions({
  profile,
}: {
  profile: SocialProfile;
}) {
  const router = useRouter();
  const { confirm } = useConfirm();
  const queryClient = useQueryClient();
  const mutate = useNetworkActions();
  const messageMutation = useStartConversation();

  const statusQuery = useQuery({
    queryKey: statusQueryKey(profile.id),
    queryFn: ({ signal }) =>
      fetchConnectionStatusRequest(profile.id, signal).then((r) => r.status),
    enabled: !profile.isOwn && profile.id > 0,
  });

  const status = statusQuery.data;
  const busy = mutate.isPending || messageMutation.isPending;

  async function invalidateStatus() {
    await queryClient.invalidateQueries({
      queryKey: statusQueryKey(profile.id),
    });
  }

  if (profile.isOwn) return null;

  if (statusQuery.isLoading) {
    return (
      <div className="flex flex-wrap gap-2 pt-1">
        <Button type="button" size="sm" disabled>
          Connect
        </Button>
        <Button type="button" variant="outline" size="sm" disabled>
          Message
        </Button>
      </div>
    );
  }

  if (statusQuery.error) {
    return (
      <div className="pt-1">
        <p className="text-xs text-destructive">
          {statusQuery.error instanceof ApiError
            ? statusQuery.error.message
            : "Unable to load connection status"}
        </p>
      </div>
    );
  }

  if (!status || status.status === "self") return null;

  return (
    <div className="flex flex-wrap gap-2 pt-1">
      {status.canAccept && status.connectionId ? (
        <>
          <Button
            type="button"
            size="sm"
            disabled={busy}
            onClick={() =>
              mutate.mutate(
                { action: "accept", connectionId: status.connectionId! },
                { onSuccess: () => void invalidateStatus() }
              )
            }
          >
            Accept
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={busy}
            onClick={() =>
              mutate.mutate(
                { action: "reject", connectionId: status.connectionId! },
                { onSuccess: () => void invalidateStatus() }
              )
            }
          >
            Decline
          </Button>
        </>
      ) : null}

      {status.canWithdraw && status.connectionId ? (
        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={busy}
          onClick={() =>
            mutate.mutate(
              { action: "withdraw", connectionId: status.connectionId! },
              { onSuccess: () => void invalidateStatus() }
            )
          }
        >
          Withdraw
        </Button>
      ) : null}

      {status.canRemove && status.connectionId ? (
        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={busy}
          onClick={() => {
            void (async () => {
              const ok = await confirm(CONFIRM_REMOVE_CONNECTION);
              if (!ok) return;
              mutate.mutate(
                { action: "remove", connectionId: status.connectionId! },
                { onSuccess: () => void invalidateStatus() }
              );
            })();
          }}
        >
          Remove
        </Button>
      ) : null}

      {(status.canSendRequest || status.status === "none") &&
      !status.canAccept &&
      !status.canWithdraw &&
      !status.canRemove ? (
        <Button
          type="button"
          size="sm"
          disabled={busy}
          onClick={() =>
            mutate.mutate(
              { action: "send", userId: profile.id },
              { onSuccess: () => void invalidateStatus() }
            )
          }
        >
          Connect
        </Button>
      ) : null}

      <Button
        type="button"
        variant="outline"
        size="sm"
        disabled={busy}
        onClick={() =>
          messageMutation.mutate(profile.id, {
            onSuccess: (result) => {
              router.push(`/messages/${result.conversationId}`);
            },
          })
        }
      >
        Message
      </Button>
    </div>
  );
}
