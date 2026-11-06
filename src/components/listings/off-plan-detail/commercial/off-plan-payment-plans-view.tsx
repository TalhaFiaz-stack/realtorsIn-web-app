"use client";

import { asRecordArray } from "@/features/off-plan/lib/off-plan-commercial-json";
import { OffPlanPaymentPlanCard } from "@/components/listings/off-plan-detail/commercial/off-plan-payment-plan-card";

export function OffPlanPaymentPlansView({ data }: { data: unknown }) {
  const plans = asRecordArray(data);
  if (plans.length === 0) {
    return (
      <p className="px-2 text-sm text-muted-foreground">No payment plans available.</p>
    );
  }
  return (
    <div className="space-y-3">
      {plans.map((plan, index) => (
        <OffPlanPaymentPlanCard key={String(plan.id ?? index)} plan={plan} />
      ))}
    </div>
  );
}
