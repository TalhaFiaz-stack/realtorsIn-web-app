"use client";

import Link from "next/link";
import { Loader2, Mail, MessageCircle, Phone } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import type { PropertyAgentContact } from "@/features/properties/lib/build-social-property-agent-contact";

export function PropertyMatchContactDialog({
  open,
  onOpenChange,
  contact,
  messaging,
  onMessage,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  contact: PropertyAgentContact | null;
  messaging?: boolean;
  onMessage: () => void;
}) {
  if (!contact) return null;

  const initials = contact.name
    .split(/\s+/)
    .map((p) => p[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle>Contact agent</DialogTitle>
          <DialogDescription>
            Send a message to the listing agent about this property.
          </DialogDescription>
        </DialogHeader>

        <div className="flex items-center gap-3">
          <Avatar className="h-12 w-12">
            {contact.profileImage ? (
              <AvatarImage src={contact.profileImage} alt="" />
            ) : null}
            <AvatarFallback>{initials || "A"}</AvatarFallback>
          </Avatar>
          <div className="min-w-0">
            <p className="truncate font-semibold">{contact.name}</p>
            {contact.username ? (
              <p className="truncate text-sm text-muted-foreground">
                @{contact.username}
              </p>
            ) : null}
          </div>
        </div>

        <div className="flex flex-col gap-2">
          {contact.receiverId ? (
            <Button
              type="button"
              className="w-full"
              disabled={messaging}
              onClick={onMessage}
            >
              {messaging ? (
                <Loader2 className="me-2 h-4 w-4 animate-spin" aria-hidden />
              ) : (
                <MessageCircle className="me-2 h-4 w-4" aria-hidden />
              )}
              Message on RealtorsIn
            </Button>
          ) : null}
          {contact.phone ? (
            <Button variant="outline" className="w-full" asChild>
              <Link href={`tel:${contact.phone}`}>
                <Phone className="me-2 h-4 w-4" aria-hidden />
                Call {contact.phone}
              </Link>
            </Button>
          ) : null}
          {contact.email ? (
            <Button variant="outline" className="w-full" asChild>
              <Link href={`mailto:${contact.email}`}>
                <Mail className="me-2 h-4 w-4" aria-hidden />
                Email agent
              </Link>
            </Button>
          ) : null}
        </div>
      </DialogContent>
    </Dialog>
  );
}
