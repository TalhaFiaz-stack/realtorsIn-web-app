"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  mutationErrorMessage,
  useUpdateAbout,
} from "@/features/profile/hooks/use-profile-mutations";
import type { SocialProfile } from "@/features/profile/types/profile.types";
import { cn } from "@/lib/utils";

export function ProfileAboutDialog({
  open,
  onOpenChange,
  profile,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  profile: SocialProfile;
}) {
  const mutation = useUpdateAbout();
  const [aboutText, setAboutText] = useState(profile.aboutText ?? "");
  const [topSkillIds, setTopSkillIds] = useState<number[]>(profile.topSkillIds);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    setAboutText(profile.aboutText ?? "");
    setTopSkillIds(profile.topSkillIds);
    setError(null);
  }, [open, profile]);

  function toggleSkill(id: number) {
    setTopSkillIds((current) => {
      if (current.includes(id)) return current.filter((item) => item !== id);
      if (current.length >= 5) return current;
      return [...current, id];
    });
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit about</DialogTitle>
        </DialogHeader>
        <div className="space-y-3">
          <div className="space-y-1.5">
            <Label>About</Label>
            <Textarea
              value={aboutText}
              onChange={(e) => setAboutText(e.target.value)}
              maxLength={2600}
              className="min-h-40"
            />
            <p className="text-xs text-muted-foreground">
              {aboutText.length}/2600
            </p>
          </div>
          {profile.skills.length > 0 ? (
            <div className="space-y-2">
              <Label>Top skills (max 5)</Label>
              <div className="flex flex-wrap gap-2">
                {profile.skills.map((skill) => {
                  const selected = topSkillIds.includes(skill.id);
                  return (
                    <button
                      key={skill.id}
                      type="button"
                      onClick={() => toggleSkill(skill.id)}
                      className={cn(
                        "rounded-full border px-3 py-1 text-sm",
                        selected
                          ? "border-primary bg-accent text-accent-foreground"
                          : "border-border text-muted-foreground"
                      )}
                    >
                      {skill.name}
                    </button>
                  );
                })}
              </div>
            </div>
          ) : null}
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
                {
                  aboutId: profile.aboutId,
                  aboutText: aboutText.trim(),
                  topSkillIds,
                },
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
