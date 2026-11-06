"use client";

import { Mail, Phone } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import type { RemAgentContact } from "@/features/off-plan/types/off-plan.types";

export function PublishedAgentContactDialogs({
  contactOpen,
  onContactOpenChange,
  inquiryOpen,
  onInquiryOpenChange,
  contact,
}: {
  contactOpen: boolean;
  onContactOpenChange: (open: boolean) => void;
  inquiryOpen: boolean;
  onInquiryOpenChange: (open: boolean) => void;
  contact: RemAgentContact | null | undefined;
}) {
  return (
    <>
      <Dialog open={contactOpen} onOpenChange={onContactOpenChange}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Contact agent</DialogTitle>
          </DialogHeader>
          {contact ? (
            <div className="space-y-3">
              <p className="font-semibold">{contact.name}</p>
              {contact.phone ? (
                <Button variant="outline" className="w-full justify-start" asChild>
                  <a href={`tel:${contact.phone}`}>
                    <Phone className="me-2 h-4 w-4" aria-hidden />
                    {contact.phone}
                  </a>
                </Button>
              ) : null}
              {contact.email ? (
                <Button variant="outline" className="w-full justify-start" asChild>
                  <a href={`mailto:${contact.email}`}>
                    <Mail className="me-2 h-4 w-4" aria-hidden />
                    {contact.email}
                  </a>
                </Button>
              ) : null}
            </div>
          ) : null}
        </DialogContent>
      </Dialog>

      <Dialog open={inquiryOpen} onOpenChange={onInquiryOpenChange}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{contact?.inquiryTitle ?? "Inquiry required"}</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">
            {contact?.inquiryMessage ??
              "Please complete the inquiry flow in REM to contact this agent."}
          </p>
        </DialogContent>
      </Dialog>
    </>
  );
}
