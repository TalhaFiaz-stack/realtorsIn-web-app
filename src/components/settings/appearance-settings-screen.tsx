"use client";

import { useEffect, useState } from "react";
import { Monitor, Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { SettingsAppearanceSkeleton } from "@/components/settings/settings-detail-skeleton";
import { cn } from "@/lib/utils";

const OPTIONS = [
  { id: "light" as const, label: "Light", icon: Sun },
  { id: "dark" as const, label: "Dark", icon: Moon },
  { id: "system" as const, label: "System", icon: Monitor },
];

export function AppearanceSettingsScreen() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const active = mounted ? (theme ?? "system") : "system";

  if (!mounted) {
    return <SettingsAppearanceSkeleton />;
  }

  return (
    <div className="overflow-hidden rounded-lg border border-border bg-card p-2">
      <p className="px-2 py-2 text-xs text-muted-foreground">
        Matches mobile personalize theme — stored on this device only.
      </p>
      <div className="grid gap-1 sm:grid-cols-3">
        {OPTIONS.map(({ id, label, icon: Icon }) => {
          const selected = active === id;
          return (
            <button
              key={id}
              type="button"
              disabled={!mounted}
              onClick={() => setTheme(id)}
              className={cn(
                "flex flex-col items-center gap-2 rounded-md border px-3 py-4 text-sm font-medium transition-colors",
                selected
                  ? "border-primary bg-primary/5 text-foreground"
                  : "border-transparent hover:bg-muted/80"
              )}
            >
              <Icon className="h-5 w-5" aria-hidden />
              {label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
