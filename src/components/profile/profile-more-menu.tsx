"use client";

import { useState } from "react";
import { Ban, BellOff, Loader2, MessageSquareOff, MoreVertical } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
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
import { useBlockProfile } from "@/features/profile/hooks/use-block-profile";
import type { SocialProfile } from "@/features/profile/types/profile.types";

function initials(name: string) {
  return (
    name
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((p) => p[0]?.toUpperCase())
      .join("") || "?"
  );
}

/**
 * ⋮ menu on another member's profile — mobile `SocialProfile` menu (Block),
 * with the same confirmation sheet copy (`BlockUserBTSheet`).
 */
export function ProfileMoreMenu({ profile }: { profile: SocialProfile }) {
  const [confirmOpen, setConfirmOpen] = useState(false);
  const block = useBlockProfile();
  const name = profile.fullName || profile.name || "this member";

  if (profile.isOwn || profile.id <= 0) return null;

  return (
    <>
      <DropdownMenu modal={false}>
        <DropdownMenuTrigger asChild>
          <Button
            type="button"
            variant="outline"
            size="icon"
            className="h-9 w-9 shrink-0 rounded-full bg-background/95 shadow-sm backdrop-blur-sm"
            aria-label="More options"
          >
            <MoreVertical className="h-4 w-4" aria-hidden />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-48">
          <DropdownMenuItem
            className="text-destructive focus:text-destructive"
            onSelect={() => setConfirmOpen(true)}
          >
            <Ban className="me-2 h-4 w-4" aria-hidden />
            Block
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <Dialog
        open={confirmOpen}
        onOpenChange={(open) => {
          if (!block.isPending) setConfirmOpen(open);
        }}
      >
        <DialogContent className="max-w-sm">
          <DialogHeader className="items-center text-center sm:text-center">
            <Avatar className="mb-2 h-20 w-20">
              {profile.profileImage?.url ? (
                <AvatarImage src={profile.profileImage.url} alt="" />
              ) : null}
              <AvatarFallback className="text-lg">{initials(name)}</AvatarFallback>
            </Avatar>
            <DialogTitle>Block {name}?</DialogTitle>
            <DialogDescription>
              Blocking {name} will prevent all interactions between you and
              them. You can unblock them anytime from Settings → Blocked users.
            </DialogDescription>
          </DialogHeader>

          <ul className="space-y-3 rounded-xl border border-border/70 bg-muted/30 p-3 text-sm">
            <li className="flex gap-3">
              <MessageSquareOff className="mt-0.5 h-5 w-5 shrink-0 text-muted-foreground" aria-hidden />
              <span>They won&apos;t be able to message you or find your profile or content.</span>
            </li>
            <li className="flex gap-3">
              <BellOff className="mt-0.5 h-5 w-5 shrink-0 text-muted-foreground" aria-hidden />
              <span>They won&apos;t be notified that you blocked them.</span>
            </li>
          </ul>

          <DialogFooter className="gap-2 sm:gap-2">
            <Button
              type="button"
              variant="outline"
              className="flex-1"
              disabled={block.isPending}
              onClick={() => setConfirmOpen(false)}
            >
              Not now
            </Button>
            <Button
              type="button"
              variant="destructive"
              className="flex-1"
              disabled={block.isPending}
              onClick={() =>
                block.mutate(profile.id, { onSuccess: () => setConfirmOpen(false) })
              }
            >
              {block.isPending ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden /> : null}
              Block
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
