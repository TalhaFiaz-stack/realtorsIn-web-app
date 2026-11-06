"use client";

import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";

type Props = {
  title: string;
  description?: string;
  checked: boolean;
  disabled?: boolean;
  emphasize?: boolean;
  onCheckedChange: (checked: boolean) => void;
  showDivider?: boolean;
};

export function NotificationSettingRow({
  title,
  description,
  checked,
  disabled,
  emphasize,
  onCheckedChange,
  showDivider,
}: Props) {
  return (
    <div className={cn(showDivider && "border-t border-border")}>
      <div
        className={cn(
          "flex items-start justify-between gap-4 px-4 py-3",
          emphasize && "bg-muted/30"
        )}
      >
        <div className="min-w-0 flex-1 pt-0.5">
          <p
            className={cn(
              "text-sm font-medium text-foreground",
              emphasize && "font-semibold"
            )}
          >
            {title}
          </p>
          {description ? (
            <p className="mt-0.5 text-xs leading-relaxed text-muted-foreground">
              {description}
            </p>
          ) : null}
        </div>
        <Switch
          checked={checked}
          disabled={disabled}
          onCheckedChange={onCheckedChange}
          aria-label={title}
        />
      </div>
    </div>
  );
}
