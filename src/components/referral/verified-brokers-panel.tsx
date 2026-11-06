"use client";

import { useEffect, useState } from "react";
import { Search } from "lucide-react";
import { NetworkRowActions } from "@/components/network/network-row-actions";
import { PersonRow } from "@/components/network/person-row";
import { Input } from "@/components/ui/input";
import { EmptyState } from "@/components/states/empty-state";
import { ErrorState } from "@/components/states/error-state";
import { NetworkPeopleSkeleton } from "@/components/states/list-row-skeleton";
import {
  referralErrorMessage,
  useVerifiedBrokers,
} from "@/features/referral/hooks/use-referral";
import { useNetworkActions } from "@/features/network/hooks/use-network";

export function VerifiedBrokersPanel({
  enabled,
  showHeader = true,
}: {
  enabled: boolean;
  /** Hide when the parent page shell already shows title + description. */
  showHeader?: boolean;
}) {
  const [search, setSearch] = useState("");
  const [debounced, setDebounced] = useState("");
  const query = useVerifiedBrokers(debounced);
  const mutate = useNetworkActions();

  useEffect(() => {
    const id = window.setTimeout(() => setDebounced(search.trim()), 300);
    return () => window.clearTimeout(id);
  }, [search]);

  if (!enabled) {
    return null;
  }

  const result = query.data;
  const locked = result && !result.ok && result.locked;
  const people =
    result && result.ok && !result.locked ? result.page.people : [];

  return (
    <section className={showHeader ? "mt-8 space-y-3" : "space-y-3"}>
      {showHeader ? (
        <header>
          <h2 className="text-base font-semibold">Verified brokers</h2>
          <p className="text-sm text-muted-foreground">
            Connect with brokers who verified their card on RealtorsIn.
          </p>
        </header>
      ) : null}

      {locked ? (
        <div className="rounded-lg border border-dashed border-border bg-muted/30 px-4 py-6 text-center text-sm text-muted-foreground">
          {result.message}
        </div>
      ) : (
        <>
          <div className="relative">
            <Search
              className="pointer-events-none absolute start-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
              aria-hidden
            />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by name or company"
              className="ps-9"
              aria-label="Search verified brokers"
            />
          </div>

          {query.isLoading ? (
            <NetworkPeopleSkeleton count={4} />
          ) : query.error ? (
            <ErrorState
              title="Unable to load brokers"
              description={referralErrorMessage(query.error)}
              onRetry={() => void query.refetch()}
            />
          ) : people.length === 0 ? (
            <EmptyState
              title="No brokers found"
              description={
                debounced
                  ? "Try a different search."
                  : "Verified brokers will appear here."
              }
            />
          ) : (
            <ul className="overflow-hidden rounded-lg border border-border bg-card px-2 shadow-sm">
              {people.map((person, index) => (
                <PersonRow
                  key={`${person.userId}-${index}`}
                  person={person}
                  actions={
                    <NetworkRowActions
                      person={person}
                      context="search"
                      mutatePending={mutate.isPending}
                      mutateVariables={mutate.variables ?? null}
                      onMutate={(input) => mutate.mutate(input)}
                    />
                  }
                />
              ))}
            </ul>
          )}
        </>
      )}
    </section>
  );
}
