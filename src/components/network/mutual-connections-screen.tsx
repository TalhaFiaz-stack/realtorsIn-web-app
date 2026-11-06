"use client";

import Link from "next/link";
import { ShellBackLink } from "@/components/navigation/shell-back-link";
import { ShellBackRow } from "@/components/navigation/shell-back-row";
import { NetworkRowActions } from "@/components/network/network-row-actions";
import { PersonRow } from "@/components/network/person-row";
import { EmptyState } from "@/components/states/empty-state";
import { ErrorState } from "@/components/states/error-state";
import { NetworkPeopleSkeleton } from "@/components/states/list-row-skeleton";
import {
  networkErrorMessage,
  useMutualConnections,
  useNetworkActions,
} from "@/features/network/hooks/use-network";

export function MutualConnectionsScreen({
  remUserId,
  socialProfileId,
  subjectName,
}: {
  remUserId?: number;
  socialProfileId?: number;
  subjectName?: string;
}) {
  const query = useMutualConnections({ remUserId, socialProfileId });
  const mutate = useNetworkActions();
  const people = query.data?.people ?? [];
  const label = subjectName?.trim() || "this member";

  return (
    <div className="w-full max-w-2xl space-y-4 pb-8">
      <ShellBackRow>
        <ShellBackLink href="/connections" label="Network" />
      </ShellBackRow>
      <header className="space-y-1 px-0.5">
        <h1 className="text-xl font-semibold tracking-tight">
          Mutual connections
        </h1>
        <p className="text-sm text-muted-foreground">
          People you and {label} are both connected with on RealtorsIn.
        </p>
      </header>

      {query.isLoading ? (
        <NetworkPeopleSkeleton count={5} />
      ) : query.isError ? (
        <ErrorState
          title="Unable to load mutual connections"
          description={networkErrorMessage(query.error)}
          onRetry={() => void query.refetch()}
        />
      ) : people.length === 0 ? (
        <EmptyState
          title="No mutual connections"
          description="You do not share any connections with this person yet."
        />
      ) : (
        <ul className="overflow-hidden rounded-lg border border-border bg-card px-2 shadow-sm">
          {people.map((person) => (
            <PersonRow
              key={person.userId ?? person.connectionId ?? person.name}
              person={person}
              actions={
                <NetworkRowActions
                  person={person}
                  context="all"
                  mutatePending={mutate.isPending}
                  mutateVariables={mutate.variables ?? null}
                  onMutate={(input) => mutate.mutate(input)}
                />
              }
            />
          ))}
        </ul>
      )}

      <p className="text-center text-xs text-muted-foreground">
        <Link href="/connections/suggestions" className="text-primary hover:underline">
          Discover more people
        </Link>
      </p>
    </div>
  );
}
