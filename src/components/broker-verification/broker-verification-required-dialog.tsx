"use client";

import Link from "next/link";
import { CheckCircle2, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  BROKER_GATE_BENEFITS,
  type BrokerGateState,
} from "@/features/broker-verification/lib/broker-gate";

const VERIFY_HREF = "/me/broker-verification";

export function BrokerVerificationRequiredDialog({
  open,
  state,
  onOpenChange,
}: {
  open: boolean;
  state: BrokerGateState;
  onOpenChange: (open: boolean) => void;
}) {
  const pending = state === "pending";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90dvh] max-w-md overflow-y-auto">
        <DialogHeader className="items-center text-center sm:text-center">
          <span className="mb-1 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
            <ShieldCheck className="h-6 w-6" aria-hidden />
          </span>
          <DialogTitle>
            {pending ? "Verification under review" : "Verified brokers only"}
          </DialogTitle>
          <DialogDescription>
            {pending
              ? "Your broker card is being reviewed. Project details unlock as soon as it is approved."
              : "Verify your broker card to open off-plan project details, units and sales contacts."}
          </DialogDescription>
        </DialogHeader>

        <ul className="space-y-2.5">
          {BROKER_GATE_BENEFITS.map((b) => (
            <li key={b.title} className="flex gap-2.5 text-sm">
              <CheckCircle2
                className="mt-0.5 h-4 w-4 shrink-0 text-[#059669]"
                aria-hidden
              />
              <span>
                <span className="font-medium">{b.title}</span>
                <span className="block text-xs text-muted-foreground">
                  {b.description}
                </span>
              </span>
            </li>
          ))}
        </ul>

        <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
            Later
          </Button>
          <Button asChild onClick={() => onOpenChange(false)}>
            <Link href={VERIFY_HREF}>
              {pending ? "View status" : "Get verified"}
            </Link>
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
