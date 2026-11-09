"use client";

import { ListRowSkeleton } from "@/components/states/list-row-skeleton";
import { EmptyState } from "@/components/states/empty-state";
import { ErrorState } from "@/components/states/error-state";
import { Avatar, AvatarImage, AvatarPlaceholderFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { useBlockActions, useBlockedUsers } from "@/features/chat/hooks/use-chat";

export function BlockedUsersScreen() {
  const query = useBlockedUsers();
  const { unblock } = useBlockActions();

  if (query.isLoading) {
    return (
      <div className="space-y-2" aria-busy aria-label="Loading blocked users">
        {Array.from({ length: 3 }).map((_, i) => (
          <ListRowSkeleton key={i} />
        ))}
      </div>
    );
  }

  if (query.isError) {
    return (
      <ErrorState
        title="Unable to load blocked users"
        onRetry={() => void query.refetch()}
      />
    );
  }

  const users = query.data ?? [];
  if (users.length === 0) {
    return (
      <EmptyState
        title="No blocked users"
        description="Members you block from a conversation appear here."
      />
    );
  }

  return (
    <ul className="divide-y divide-border overflow-hidden rounded-lg border border-border bg-card">
      {users.map((user) => (
        <li key={user.userId} className="flex items-center gap-3 px-4 py-3">
          <Avatar className="h-10 w-10">
            {user.avatarUrl ? <AvatarImage src={user.avatarUrl} alt="" /> : null}
            <AvatarPlaceholderFallback />
          </Avatar>
          <div className="min-w-0 flex-1">
            <p className="locale-text truncate text-sm font-semibold">{user.name}</p>
            {user.blockedAt ? (
              <p className="text-xs text-muted-foreground">
                Blocked {new Date(user.blockedAt).toLocaleDateString()}
              </p>
            ) : null}
          </div>
          <Button
            type="button"
            size="sm"
            variant="outline"
            disabled={unblock.isPending && unblock.variables === user.userId}
            onClick={() => unblock.mutate(user.userId)}
          >
            Unblock
          </Button>
        </li>
      ))}
    </ul>
  );
}
