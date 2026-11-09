"use client";

import { useEffect, useMemo, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import {
  connectionTabFromLegacyQuery,
  connectionTabFromPath,
  connectionTabPath,
  type ConnectionTabKey,
} from "@/features/network/constants/connection-routes";
import { Search, UserPlus, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ConnectedTab } from "@/components/network/connected-tab";
import { NetworkRowActions } from "@/components/network/network-row-actions";
import { PersonRow } from "@/components/network/person-row";
import { SuggestionCard } from "@/components/network/suggestion-card";
import { SuggestionsSection } from "@/components/network/suggestions-section";
import { EmptyState } from "@/components/states/empty-state";
import { ErrorState } from "@/components/states/error-state";
import { InlineLoader } from "@/components/states/inline-loader";
import { NetworkPeopleSkeleton } from "@/components/states/list-row-skeleton";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { HubControlCard, HubControlCardBody } from "@/components/hub/hub-control-card";
import { HubModuleHeader } from "@/components/hub/hub-module-header";
import {
  connectSuggestionWithDismiss,
  networkErrorMessage,
  useNetworkActions,
  useNetworkList,
} from "@/features/network/hooks/use-network";
import { filterNetworkPeople } from "@/features/network/lib/filter-network-people";
import type {
  NetworkListType,
  NetworkPerson,
} from "@/features/network/types/network.types";

type TabKey = ConnectionTabKey;

const TAB_VALUES: TabKey[] = [
  "all",
  "pending-received",
  "pending-sent",
  "suggestions",
];

export function ConnectionsScreen() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const pathTab = connectionTabFromPath(pathname);
  const legacyTab = connectionTabFromLegacyQuery(searchParams.get("tab"));
  const resolvedTab = legacyTab ?? pathTab;
  const [tab, setTab] = useState<TabKey>(
    TAB_VALUES.includes(resolvedTab) ? resolvedTab : "all"
  );

  useEffect(() => {
    setTab(TAB_VALUES.includes(resolvedTab) ? resolvedTab : "all");
  }, [resolvedTab]);

  useEffect(() => {
    if (!legacyTab) return;
    router.replace(connectionTabPath(legacyTab));
  }, [legacyTab, router]);
  const [dismissedIds, setDismissedIds] = useState<Set<number>>(new Set());
  const [listFilter, setListFilter] = useState("");

  const listQuery = useNetworkList(tab);
  const queryClient = useQueryClient();
  const suggestionsQuery = useNetworkList("suggestions");
  const mutate = useNetworkActions();
  const people = listQuery.data?.people ?? [];
  const suggestions = useMemo(
    () =>
      (suggestionsQuery.data?.people ?? []).filter(
        (person) => person.userId == null || !dismissedIds.has(person.userId)
      ),
    [suggestionsQuery.data?.people, dismissedIds]
  );

  const connectPendingUserId =
    mutate.isPending &&
    mutate.variables?.action === "send" &&
    typeof mutate.variables.userId === "number"
      ? mutate.variables.userId
      : null;

  function dismissSuggestion(person: NetworkPerson) {
    if (person.userId == null) return;
    setDismissedIds((prev) => new Set(prev).add(person.userId!));
  }

  function connectSuggestion(person: NetworkPerson) {
    if (!person.userId) return;
    connectSuggestionWithDismiss({
      mutate,
      queryClient,
      userId: person.userId,
      onDismiss: (userId) =>
        setDismissedIds((prev) => new Set(prev).add(userId)),
    });
  }

  const filteredPeople = useMemo(
    () => filterNetworkPeople(people, listFilter),
    [people, listFilter]
  );
  const filteredSuggestions = useMemo(
    () => filterNetworkPeople(suggestions, listFilter),
    [suggestions, listFilter]
  );
  const listFilterActive = listFilter.trim().length > 0;

  return (
    <div className="w-full max-w-2xl space-y-3 px-4 md:px-0">
      <Tabs
        value={tab}
        onValueChange={(value) => {
          const next = value as TabKey;
          setListFilter("");
          setTab(next);
          router.replace(connectionTabPath(next));
        }}
      >
        <HubControlCard>
          <HubControlCardBody>
            <HubModuleHeader
              title="My network"
              subtitle="Manage connections, requests and people you may know"
              icon={Users}
              action={
                <Button asChild size="sm" variant="outline" className="h-9 rounded-full">
                  <Link href="/search?tab=account">
                    <UserPlus className="h-4 w-4" aria-hidden />
                    <span className="hidden sm:inline">Find people</span>
                  </Link>
                </Button>
              }
            />
            <TabsList className="-my-1 flex h-auto w-full justify-start gap-2 overflow-x-auto bg-transparent p-0 py-1 [scrollbar-width:none]">
              <TabsTrigger value="all" className="h-8 shrink-0 rounded-full border border-border bg-background px-4 text-sm font-medium text-foreground/80 shadow-none transition-colors hover:bg-muted/60 data-[state=active]:border-primary data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-sm">
                Connected
                {listQuery.data?.totalConnections != null && tab === "all" ? (
                  <span className="ms-1.5 tabular-nums opacity-80">{listQuery.data.totalConnections}</span>
                ) : null}
              </TabsTrigger>
              <TabsTrigger value="pending-received" className="h-8 shrink-0 rounded-full border border-border bg-background px-4 text-sm font-medium text-foreground/80 shadow-none transition-colors hover:bg-muted/60 data-[state=active]:border-primary data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-sm">
                Requests
                {(listQuery.data?.pendingReceived ?? 0) > 0 ? (
                  <span className="ms-1.5 rounded-full bg-destructive px-1.5 text-[11px] font-semibold tabular-nums text-destructive-foreground">
                    {listQuery.data?.pendingReceived}
                  </span>
                ) : null}
              </TabsTrigger>
              <TabsTrigger value="pending-sent" className="h-8 shrink-0 rounded-full border border-border bg-background px-4 text-sm font-medium text-foreground/80 shadow-none transition-colors hover:bg-muted/60 data-[state=active]:border-primary data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-sm">
                Sent
                {(listQuery.data?.pendingSent ?? 0) > 0 ? (
                  <span className="ms-1.5 tabular-nums opacity-80">{listQuery.data?.pendingSent}</span>
                ) : null}
              </TabsTrigger>
              <TabsTrigger value="suggestions" className="h-8 shrink-0 rounded-full border border-border bg-background px-4 text-sm font-medium text-foreground/80 shadow-none transition-colors hover:bg-muted/60 data-[state=active]:border-primary data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-sm">
                Discover
              </TabsTrigger>
            </TabsList>
            <div className="relative">
              <Search
                className="pointer-events-none absolute start-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
                aria-hidden
              />
              <Input
                value={listFilter}
                onChange={(event) => setListFilter(event.target.value)}
                className="h-10 rounded-full bg-muted/50 ps-10"
                placeholder={
                  tab === "suggestions"
                    ? "Filter suggestions by name"
                    : "Filter this list by name or username"
                }
                aria-label="Filter network list"
              />
            </div>
            <p className="text-xs text-muted-foreground">
              Looking for verified agents?{" "}
              <Link href="/brokers" className="font-medium text-primary hover:underline">
                Browse verified brokers
              </Link>
            </p>
          </HubControlCardBody>
        </HubControlCard>

        <TabsContent value="all" className="mt-3">
          {listFilterActive && people.length > 0 && filteredPeople.length === 0 ? (
            <EmptyState
              title="No matches"
              description={`No connections match “${listFilter.trim()}”.`}
            />
          ) : (
          <ConnectedTab
            people={filteredPeople}
            suggestions={listFilterActive ? filteredSuggestions : suggestions}
            listLoading={listQuery.isLoading}
            listError={listQuery.error}
            onRetryList={() => void listQuery.refetch()}
            suggestionsLoading={suggestionsQuery.isLoading}
            connectPendingUserId={connectPendingUserId}
            mutatePending={mutate.isPending}
            mutateVariables={mutate.variables ?? null}
            onMutate={(input) => mutate.mutate(input)}
            onConnectSuggestion={connectSuggestion}
            onDismissSuggestion={dismissSuggestion}
          />
          )}
        </TabsContent>

        {(["pending-received", "pending-sent"] as const).map((key) => (
          <TabsContent key={key} value={key} className="mt-3">
            {listQuery.isLoading ? (
              <NetworkPeopleSkeleton count={5} />
            ) : listQuery.error ? (
              <ErrorState
                title="Unable to load"
                description={networkErrorMessage(listQuery.error)}
                onRetry={() => void listQuery.refetch()}
              />
            ) : people.length === 0 ? (
              <EmptyState
                title="Nothing here yet"
                description="Invite colleagues or discover people to connect."
              />
            ) : listFilterActive && filteredPeople.length === 0 ? (
              <EmptyState
                title="No matches"
                description={`No one in this list matches “${listFilter.trim()}”.`}
              />
            ) : (
              <ul className="overflow-hidden rounded-[var(--radius)] border border-border bg-card px-2 shadow-sm">
                {filteredPeople.map((person, index) => (
                  <PersonRow
                    key={`${person.connectionId ?? person.userId}-${index}`}
                    person={person}
                    actions={
                      <NetworkRowActions
                        person={person}
                        context={key}
                        mutatePending={mutate.isPending}
                        mutateVariables={mutate.variables ?? null}
                        onMutate={(input) => mutate.mutate(input)}
                      />
                    }
                  />
                ))}
              </ul>
            )}
          </TabsContent>
        ))}

        <TabsContent value="suggestions" className="mt-3">
          {suggestionsQuery.isLoading ? (
            <SuggestionsSection
              suggestions={[]}
              loading
              maxItems={8}
              showAllHref={null}
              onConnect={() => undefined}
            />
          ) : suggestionsQuery.error ? (
            <ErrorState
              title="Unable to load"
              description={networkErrorMessage(suggestionsQuery.error)}
              onRetry={() => void suggestionsQuery.refetch()}
            />
          ) : suggestions.length === 0 ? (
            <EmptyState
              title="Nothing here yet"
              description="Suggestions will appear as your network grows."
            />
          ) : listFilterActive && filteredSuggestions.length === 0 ? (
            <EmptyState
              title="No matches"
              description={`No suggestions match “${listFilter.trim()}”.`}
            />
          ) : (
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              {filteredSuggestions.map((person) => (
                <SuggestionCard
                  key={person.userId ?? person.name}
                  person={person}
                  connectPending={
                    person.userId != null &&
                    connectPendingUserId === person.userId
                  }
                  onConnect={() => connectSuggestion(person)}
                  onDismiss={() => dismissSuggestion(person)}
                />
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {mutate.isPending ? (
        <div className="flex justify-center py-3">
          <InlineLoader className="text-primary" />
        </div>
      ) : null}
    </div>
  );
}
