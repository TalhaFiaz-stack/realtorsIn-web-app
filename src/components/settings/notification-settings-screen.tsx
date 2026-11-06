"use client";

import { useMemo, useState } from "react";
import { NOTIFICATION_SETTING_SECTIONS } from "@/features/settings/constants/notification-settings-sections";
import {
  notificationSettingsErrorMessage,
  useNotificationSettingsMutations,
  useNotificationSettingsQuery,
} from "@/features/settings/hooks/use-notification-settings";
import { NotificationSettingRow } from "@/components/settings/notification-setting-row";
import { Button } from "@/components/ui/button";
import { SettingsToggleListSkeleton } from "@/components/settings/settings-detail-skeleton";

export function NotificationSettingsScreen() {
  const { data: settings = [], isLoading, isError, error, refetch } =
    useNotificationSettingsQuery();
  const { patchOne, patchBatch } = useNotificationSettingsMutations();
  const [pendingKeys, setPendingKeys] = useState<Set<string>>(new Set());

  const sectioned = useMemo(() => {
    const byKey = Object.fromEntries(settings.map((s) => [s.key, s]));
    const known = new Set<string>();
    const sections = NOTIFICATION_SETTING_SECTIONS.map((section) => {
      const items = section.keys
        .map((key) => byKey[key])
        .filter(Boolean);
      items.forEach((item) => known.add(item.key));
      return { ...section, items };
    }).filter((section) => section.items.length > 0);

    const leftovers = settings.filter((s) => !known.has(s.key));
    if (leftovers.length > 0) {
      sections.push({
        id: "more",
        label: "More",
        keys: leftovers.map((s) => s.key),
        items: leftovers,
      });
    }
    return sections;
  }, [settings]);

  const enabledCount = settings.filter((s) => s.value).length;
  const masterOn = enabledCount > 0;
  const busy =
    patchOne.isPending ||
    patchBatch.isPending ||
    pendingKeys.size > 0;

  const toggleKey = async (key: string, value: boolean) => {
    if (busy || pendingKeys.has(key)) return;
    setPendingKeys((prev) => new Set(prev).add(key));
    try {
      await patchOne.mutateAsync({ key, value });
    } finally {
      setPendingKeys((prev) => {
        const next = new Set(prev);
        next.delete(key);
        return next;
      });
    }
  };

  const toggleAll = async (value: boolean) => {
    if (busy || settings.length === 0) return;
    await patchBatch.mutateAsync(
      settings.map((s) => ({ key: s.key, value }))
    );
  };

  if (isLoading && settings.length === 0) {
    return <SettingsToggleListSkeleton />;
  }

  if (isError) {
    return (
      <div className="rounded-lg border border-border bg-card p-4 text-center">
        <p className="text-sm text-muted-foreground">
          {notificationSettingsErrorMessage(error)}
        </p>
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="mt-3"
          onClick={() => void refetch()}
        >
          Retry
        </Button>
      </div>
    );
  }

  if (settings.length === 0) {
    return (
      <div className="rounded-lg border border-border bg-card p-4 text-center">
        <p className="text-sm text-muted-foreground">
          No notification settings found.
        </p>
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="mt-3"
          onClick={() => void refetch()}
        >
          Retry
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="rounded-lg border border-border bg-card px-4 py-3">
        <p className="text-sm font-semibold">Push notifications</p>
        <p className="mt-1 text-xs text-muted-foreground">
          Choose which social activity alerts you want to receive.
        </p>
      </div>

      <div>
        <p className="mb-2 px-1 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          General
        </p>
        <div className="overflow-hidden rounded-lg border border-border bg-card">
          <NotificationSettingRow
            title="Enable notifications"
            description={
              masterOn
                ? `${enabledCount} of ${settings.length} types enabled`
                : "All notification types are off"
            }
            checked={masterOn}
            disabled={busy}
            emphasize
            onCheckedChange={(checked) => void toggleAll(checked)}
          />
        </div>
      </div>

      {sectioned.map((section) => (
        <div key={section.id}>
          <p className="mb-2 px-1 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            {section.label}
          </p>
          <div className="overflow-hidden rounded-lg border border-border bg-card">
            {section.items.map((item, index) => (
              <NotificationSettingRow
                key={item.key}
                title={item.title}
                description={item.description}
                checked={item.value}
                disabled={busy || pendingKeys.has(item.key)}
                showDivider={index > 0}
                onCheckedChange={(checked) =>
                  void toggleKey(item.key, checked)
                }
              />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
