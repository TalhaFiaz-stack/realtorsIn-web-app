"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { CreateStoryForm } from "@/components/stories/create-story-form";

export function CreateStoryDialog({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Create story</DialogTitle>
          <DialogDescription>
            Stories disappear after 24 hours. Share a photo or short video with
            your network.
          </DialogDescription>
        </DialogHeader>

        <CreateStoryForm
          onCancel={() => onOpenChange(false)}
          onPublished={() => onOpenChange(false)}
        />
      </DialogContent>
    </Dialog>
  );
}
