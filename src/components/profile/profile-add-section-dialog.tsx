"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export type ProfileAddSectionTarget =
  | "position"
  | "education"
  | "skill"
  | "certificate";

const ITEMS: Array<{
  id: ProfileAddSectionTarget;
  title: string;
  description: string;
}> = [
  {
    id: "position",
    title: "Add position",
    description: "Work experience and current role",
  },
  {
    id: "education",
    title: "Add education",
    description: "Schools, degrees, and courses",
  },
  {
    id: "skill",
    title: "Add skill",
    description: "Professional skills on your profile",
  },
  {
    id: "certificate",
    title: "Add license & certification",
    description: "Licenses and certificates",
  },
];

export function ProfileAddSectionDialog({
  open,
  onOpenChange,
  onSelect,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelect: (target: ProfileAddSectionTarget) => void;
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add section</DialogTitle>
        </DialogHeader>
        <div className="space-y-2">
          {ITEMS.map((item) => (
            <button
              key={item.id}
              type="button"
              className="locale-text w-full rounded-xl border border-border px-4 py-3 text-start transition hover:bg-muted/50"
              onClick={() => {
                onOpenChange(false);
                onSelect(item.id);
              }}
            >
              <p className="font-medium text-foreground">{item.title}</p>
              <p className="text-sm text-muted-foreground">{item.description}</p>
            </button>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
}
