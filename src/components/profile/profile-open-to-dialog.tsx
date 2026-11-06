"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  mutationErrorMessage,
  useUpdateOpenTo,
} from "@/features/profile/hooks/use-profile-mutations";
import type { SocialProfile } from "@/features/profile/types/profile.types";

const OPTIONS = [
  {
    value: "hiring" as const,
    title: "Hiring",
    description: "You’re hiring and open to candidates.",
  },
  {
    value: "open_to_work" as const,
    title: "Open to work",
    description: "You’re looking for new opportunities.",
  },
  {
    value: "none" as const,
    title: "No one",
    description: "Clear availability from your profile.",
  },
];

export function ProfileOpenToDialog({
  open,
  onOpenChange,
  current,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  current: SocialProfile["openTo"];
}) {
  const mutation = useUpdateOpenTo();
  const [selected, setSelected] = useState<"hiring" | "open_to_work" | "none">(
    current ?? "none"
  );
  const [error, setError] = useState<string | null>(null);

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        if (!next) setError(null);
        else setSelected(current ?? "none");
        onOpenChange(next);
      }}
    >
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Open to</DialogTitle>
          <DialogDescription>
            Choose how your availability appears on your profile.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-2">
          {OPTIONS.map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() => setSelected(option.value)}
              className={
                selected === option.value
                  ? "locale-text w-full rounded-xl border border-primary bg-accent/50 px-4 py-3 text-start"
                  : "locale-text w-full rounded-xl border border-border px-4 py-3 text-start hover:bg-muted/50"
              }
            >
              <p className="font-medium">{option.title}</p>
              <p className="text-sm text-muted-foreground">
                {option.description}
              </p>
            </button>
          ))}
        </div>
        {error ? <p className="text-sm text-destructive">{error}</p> : null}
        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
          >
            Cancel
          </Button>
          <Button
            type="button"
            disabled={mutation.isPending}
            onClick={() => {
              setError(null);
              mutation.mutate(
                { openTo: selected },
                {
                  onSuccess: () => onOpenChange(false),
                  onError: (err) => setError(mutationErrorMessage(err)),
                }
              );
            }}
          >
            {mutation.isPending ? "Saving…" : "Save"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
