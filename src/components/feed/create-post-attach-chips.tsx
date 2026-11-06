"use client";

import { Home, ImageIcon, Landmark, Search, Video } from "lucide-react";
import type { CreateAttachType } from "@/features/feed/hooks/use-create-post";
import { cn } from "@/lib/utils";

const CHIPS: {
  type: Exclude<CreateAttachType, null>;
  label: string;
  color: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: string;
  comingSoon?: boolean;
}[] = [
  { type: "photo", label: "Photo", color: "#7C3AED", icon: ImageIcon },
  { type: "video", label: "Video", color: "#E85D5D", icon: Video },
  {
    type: "off_plan",
    label: "Off Plan",
    color: "#1190A8",
    icon: Landmark,
    comingSoon: true,
  },
  {
    type: "inquiry",
    label: "Inquiry",
    color: "#E28018",
    icon: Search,
    badge: "NEW",
  },
  {
    type: "property",
    label: "Property",
    color: "#22A06B",
    icon: Home,
    badge: "NEW",
  },
];

export function CreatePostAttachChips({
  attachType,
  onSelect,
  disabled,
}: {
  attachType: CreateAttachType;
  onSelect: (type: Exclude<CreateAttachType, null>) => void;
  disabled?: boolean;
}) {
  return (
    <div className="flex flex-wrap gap-2">
      {CHIPS.map((chip) => {
        const Icon = chip.icon;
        const selected = attachType === chip.type;
        return (
          <button
            key={chip.type}
            type="button"
            disabled={disabled}
            onClick={() => onSelect(chip.type)}
            className={cn(
              "relative inline-flex items-center gap-1.5 rounded-xl border px-3 py-2 text-xs font-semibold transition-colors",
              selected
                ? "border-transparent text-white"
                : "border-border bg-card text-foreground hover:bg-muted",
              disabled && "opacity-50"
            )}
            style={selected ? { backgroundColor: chip.color } : undefined}
          >
            {chip.badge ? (
              <span className="absolute -right-1 -top-1 rounded bg-[#112F6B] px-1 text-[9px] font-bold text-white">
                {chip.badge}
              </span>
            ) : null}
            <span style={{ color: selected ? "#fff" : chip.color }}>
              <Icon className="h-4 w-4" />
            </span>
            {chip.label}
          </button>
        );
      })}
    </div>
  );
}
