"use client";

import { DetailListCardSkeleton } from "@/components/states/detail-list-skeleton";
import { useConfirm } from "@/components/common/confirm-provider";
import { EmptyState } from "@/components/states/empty-state";
import { ErrorState } from "@/components/states/error-state";
import { Button } from "@/components/ui/button";
import { CONFIRM_DELETE_PROFILE_ITEM } from "@/constants/confirm-copy";
import type { WorkingOnItem } from "@/features/working-on/types/working-on.types";
import {
  useRemoveWorkingOnProject,
  useRemoveWorkingOnProperty,
  useWorkingOn,
  workingOnErrorMessage,
} from "@/features/working-on/hooks/use-working-on";
import { showAppToast } from "@/lib/toast/app-toast";

function ItemRow({
  item,
  onRemove,
  pending,
}: {
  item: WorkingOnItem;
  onRemove: () => void;
  pending: boolean;
}) {
  return (
    <li className="flex items-start justify-between gap-3 border-b border-border px-4 py-3 last:border-0">
      <div className="min-w-0">
        <p className="font-medium text-foreground">{item.title}</p>
        {item.subtitle ? (
          <p className="text-sm text-muted-foreground">{item.subtitle}</p>
        ) : null}
        <p className="text-xs capitalize text-muted-foreground">
          {item.kind === "project" ? "Off-plan project" : "Property"}
          {item.propertyType ? ` · ${item.propertyType}` : ""}
        </p>
      </div>
      <Button
        type="button"
        size="sm"
        variant="ghost"
        disabled={pending}
        onClick={onRemove}
      >
        Remove
      </Button>
    </li>
  );
}

export function WorkingOnScreen() {
  const query = useWorkingOn();
  const { confirm } = useConfirm();
  const removeProject = useRemoveWorkingOnProject();
  const removeProperty = useRemoveWorkingOnProperty();

  if (query.isLoading) {
    return (
      <DetailListCardSkeleton
        rows={4}
        ariaLabel="Loading working on items"
      />
    );
  }

  if (query.isError) {
    return (
      <ErrorState
        title="Could not load items"
        description={workingOnErrorMessage(query.error)}
        onRetry={() => void query.refetch()}
      />
    );
  }

  const projects = query.data?.projects ?? [];
  const properties = query.data?.properties ?? [];
  const total = projects.length + properties.length;

  if (total === 0) {
    return (
      <EmptyState
        title="Nothing listed yet"
        description="Projects and properties you mark as “working on” in the mobile app appear here."
      />
    );
  }

  async function removeItem(item: WorkingOnItem) {
    const ok = await confirm({
      ...CONFIRM_DELETE_PROFILE_ITEM,
      title: "Remove from working on?",
      description: "This item will no longer show on your profile.",
      detail: item.title,
      confirmLabel: "Remove",
    });
    if (!ok) return;
    try {
      const res =
        item.kind === "project"
          ? await removeProject.mutateAsync(item.id)
          : await removeProperty.mutateAsync({
              propertyId: item.id,
              type: item.propertyType ?? undefined,
            });
      showAppToast.success("Removed", res.message);
    } catch (error) {
      showAppToast.fromError(error, "Could not remove");
    }
  }

  return (
    <div className="space-y-4">
      {projects.length > 0 ? (
        <section className="rounded-xl border border-border bg-card">
          <h2 className="border-b border-border px-4 py-2 text-sm font-semibold">
            Projects
          </h2>
          <ul>
            {projects.map((item) => (
              <ItemRow
                key={`p-${item.id}`}
                item={item}
                pending={removeProject.isPending || removeProperty.isPending}
                onRemove={() => void removeItem(item)}
              />
            ))}
          </ul>
        </section>
      ) : null}
      {properties.length > 0 ? (
        <section className="rounded-xl border border-border bg-card">
          <h2 className="border-b border-border px-4 py-2 text-sm font-semibold">
            Properties
          </h2>
          <ul>
            {properties.map((item) => (
              <ItemRow
                key={`r-${item.id}`}
                item={item}
                pending={removeProject.isPending || removeProperty.isPending}
                onRemove={() => void removeItem(item)}
              />
            ))}
          </ul>
        </section>
      ) : null}
    </div>
  );
}
