"use client";

import type { ReactNode } from "react";
import { useRouter } from "next/navigation";
import { useConfirm } from "@/components/common/confirm-provider";
import { Button } from "@/components/ui/button";
import { InlineLoader } from "@/components/states/inline-loader";
import { CONFIRM_REMOVE_CONNECTION } from "@/constants/confirm-copy";
import { useStartConversation } from "@/features/chat/hooks/use-chat";
import {
  networkPendingKey,
  type NetworkAction,
} from "@/features/network/hooks/use-network";
import type { NetworkPerson } from "@/features/network/types/network.types";
import { cn } from "@/lib/utils";

type ActionContext = "all" | "pending-received" | "pending-sent" | "search";

const compactBtnClass = "h-8 px-2.5 text-xs";

export function NetworkRowActions({
  person,
  context,
  mutatePending,
  mutateVariables,
  onMutate,
}: {
  person: NetworkPerson;
  context: ActionContext;
  mutatePending: boolean;
  mutateVariables: {
    action: NetworkAction;
    connectionId?: number;
    userId?: number;
  } | null;
  onMutate: (input: {
    action: NetworkAction;
    connectionId?: number;
    userId?: number;
  }) => void;
}): ReactNode {
  const router = useRouter();
  const { confirm } = useConfirm();
  const messageMutation = useStartConversation();
  const activePendingKey =
    mutatePending && mutateVariables
      ? networkPendingKey(mutateVariables)
      : null;
  const messagingUserId =
    messageMutation.isPending && typeof messageMutation.variables === "number"
      ? messageMutation.variables
      : null;

  function isActionPending(input: {
    action: NetworkAction;
    connectionId?: number;
    userId?: number;
  }) {
    const key = networkPendingKey(input);
    return Boolean(key && activePendingKey === key);
  }

  if (
    (context === "pending-received" ||
      (context === "search" && person.status === "request_received")) &&
    person.connectionId
  ) {
    return (
      <>
        <Button
          size="sm"
          className={compactBtnClass}
          disabled={isActionPending({
            action: "accept",
            connectionId: person.connectionId,
          })}
          onClick={() =>
            onMutate({
              action: "accept",
              connectionId: person.connectionId!,
            })
          }
        >
          Accept
        </Button>
        <Button
          size="sm"
          className={compactBtnClass}
          variant="outline"
          disabled={isActionPending({
            action: "reject",
            connectionId: person.connectionId,
          })}
          onClick={() =>
            onMutate({
              action: "reject",
              connectionId: person.connectionId!,
            })
          }
        >
          Decline
        </Button>
      </>
    );
  }

  if (
    (context === "pending-sent" ||
      (context === "search" && person.status === "request_sent")) &&
    person.connectionId
  ) {
    return (
      <Button
        size="sm"
        className={compactBtnClass}
        variant="outline"
        disabled={isActionPending({
          action: "withdraw",
          connectionId: person.connectionId,
        })}
        onClick={() =>
          onMutate({
            action: "withdraw",
            connectionId: person.connectionId!,
          })
        }
      >
        Withdraw
      </Button>
    );
  }

  if (
    context === "all" ||
    person.status === "accepted" ||
    person.status === "connected"
  ) {
    if (person.connectionId) {
      return (
        <>
          {person.userId ? (
            <Button
              size="sm"
              className={compactBtnClass}
              variant="outline"
              disabled={messagingUserId === person.userId}
              onClick={() =>
                messageMutation.mutate(person.userId!, {
                  onSuccess: (result) => {
                    router.push(`/messages/${result.conversationId}`);
                  },
                })
              }
            >
              Message
            </Button>
          ) : null}
          <Button
            size="sm"
            className={compactBtnClass}
            variant="ghost"
            disabled={isActionPending({
              action: "remove",
              connectionId: person.connectionId,
            })}
            onClick={() => {
              void (async () => {
                const ok = await confirm(CONFIRM_REMOVE_CONNECTION);
                if (!ok) return;
                onMutate({
                  action: "remove",
                  connectionId: person.connectionId!,
                });
              })();
            }}
          >
            Remove
          </Button>
        </>
      );
    }
  }

  if (person.userId) {
    const sendPending = isActionPending({
      action: "send",
      userId: person.userId,
    });
    return (
      <Button
        size="sm"
        className={cn(compactBtnClass, "gap-1.5")}
        disabled={sendPending}
        onClick={() => onMutate({ action: "send", userId: person.userId! })}
      >
        {sendPending ? (
          <InlineLoader className="h-3.5 w-3.5" />
        ) : null}
        {sendPending ? "Connecting…" : "Connect"}
      </Button>
    );
  }

  return null;
}
