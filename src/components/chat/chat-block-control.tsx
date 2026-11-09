"use client";

import { useState } from "react";
import { Ban, MoreVertical, ShieldOff } from "lucide-react";
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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useBlockActions } from "@/features/chat/hooks/use-chat";

/** Thread header menu: block / unblock the other member (mobile parity). */
export function ChatBlockControl({
  userId,
  name,
  blocked,
}: {
  userId: number;
  name: string;
  blocked: boolean;
}) {
  const { block, unblock } = useBlockActions();
  const [confirmOpen, setConfirmOpen] = useState(false);
  const pending = block.isPending || unblock.isPending;

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="h-9 w-9 shrink-0"
            aria-label="Conversation options"
          >
            <MoreVertical className="h-4 w-4" aria-hidden />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-48">
          {blocked ? (
            <DropdownMenuItem
              disabled={pending}
              onSelect={() => unblock.mutate(userId)}
            >
              <ShieldOff className="me-2 h-4 w-4" aria-hidden />
              Unblock
            </DropdownMenuItem>
          ) : (
            <DropdownMenuItem
              className="text-destructive focus:text-destructive"
              onSelect={() => setConfirmOpen(true)}
            >
              <Ban className="me-2 h-4 w-4" aria-hidden />
              Block
            </DropdownMenuItem>
          )}
        </DropdownMenuContent>
      </DropdownMenu>

      <Dialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Block {name}?</DialogTitle>
            <DialogDescription>
              They won&apos;t be able to message you. You can unblock them
              anytime from Settings → Blocked users. Blocking requires a
              verified phone number.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setConfirmOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              disabled={pending}
              onClick={() =>
                block.mutate(
                  { userId },
                  { onSuccess: () => setConfirmOpen(false) }
                )
              }
            >
              {block.isPending ? "Blocking…" : "Block"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
