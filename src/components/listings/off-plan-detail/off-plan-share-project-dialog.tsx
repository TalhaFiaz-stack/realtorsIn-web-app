"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { shareOffPlanProjectPostClient } from "@/features/off-plan/services/off-plan.client";
import { useRouter } from "next/navigation";

type Props = {
  open: boolean;
  projectId: string;
  projectTitle: string;
  onOpenChange: (open: boolean) => void;
};

export function OffPlanShareProjectDialog({
  open,
  projectId,
  projectTitle,
  onOpenChange,
}: Props) {
  const router = useRouter();
  const [description, setDescription] = useState("");
  const [visibility, setVisibility] = useState<"connections" | "public">(
    "connections"
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleShare = async () => {
    setLoading(true);
    setError(null);
    try {
      await shareOffPlanProjectPostClient({
        projectId,
        description,
        visibility,
      });
      onOpenChange(false);
      router.push("/feed");
    } catch (e) {
      setError(
        e instanceof Error ? e.message : "Unable to share project to feed"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="locale-text">Share to feed</DialogTitle>
          <p className="text-sm text-muted-foreground">{projectTitle}</p>
        </DialogHeader>
        <div className="space-y-3">
          <div className="space-y-1.5">
            <Label htmlFor="share-caption">Caption (optional)</Label>
            <Textarea
              id="share-caption"
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Add a note about this project…"
            />
          </div>
          <div className="space-y-1.5">
            <Label>Visibility</Label>
            <Select
              value={visibility}
              onValueChange={(v) =>
                setVisibility(v as "connections" | "public")
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="connections">Connections</SelectItem>
                <SelectItem value="public">Public</SelectItem>
              </SelectContent>
            </Select>
          </div>
          {error ? (
            <p className="text-sm text-destructive" role="alert">
              {error}
            </p>
          ) : null}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button disabled={loading} onClick={handleShare}>
            {loading ? "Sharing…" : "Share as post"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
