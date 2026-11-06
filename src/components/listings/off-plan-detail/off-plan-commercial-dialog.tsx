"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { OffPlanBrokerInfoView } from "@/components/listings/off-plan-detail/commercial/off-plan-broker-info-view";
import { OffPlanInventoryView } from "@/components/listings/off-plan-detail/commercial/off-plan-inventory-view";
import { OffPlanParkingView } from "@/components/listings/off-plan-detail/commercial/off-plan-parking-view";
import { OffPlanPaymentPlansView } from "@/components/listings/off-plan-detail/commercial/off-plan-payment-plans-view";
import type { OffPlanProjectDetail } from "@/features/off-plan/types/off-plan.types";

export type OffPlanCommercialSheetKind =
  | "payment"
  | "parking"
  | "broker"
  | "inventory";

const TITLES: Record<OffPlanCommercialSheetKind, string> = {
  payment: "Payment plans",
  parking: "Parking",
  broker: "Info for broker",
  inventory: "Inventory overview",
};

export function OffPlanCommercialDialog({
  open,
  kind,
  project,
  onOpenChange,
}: {
  open: boolean;
  kind: OffPlanCommercialSheetKind | null;
  project: OffPlanProjectDetail | null;
  onOpenChange: (open: boolean) => void;
}) {
  if (!kind || !project) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex max-h-[min(88vh,820px)] w-[calc(100%-1.5rem)] max-w-2xl flex-col gap-0 overflow-hidden p-0">
        <DialogHeader className="shrink-0 border-b border-border px-5 py-4 text-start">
          <DialogTitle>{TITLES[kind]}</DialogTitle>
        </DialogHeader>
        <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-3 py-4 sm:px-4">
          {kind === "payment" ? (
            <OffPlanPaymentPlansView data={project.paymentPlansJson} />
          ) : null}
          {kind === "parking" ? (
            <OffPlanParkingView data={project.parkingJson} />
          ) : null}
          {kind === "broker" ? (
            <OffPlanBrokerInfoView data={project.brokerInfoJson} />
          ) : null}
          {kind === "inventory" ? (
            <OffPlanInventoryView data={project.inventoryJson} />
          ) : null}
        </div>
      </DialogContent>
    </Dialog>
  );
}
