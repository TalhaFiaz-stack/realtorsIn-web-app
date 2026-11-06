import type { OffPlanSalesExecutive } from "@/features/off-plan/types/off-plan.types";

export function offPlanSalesExecWhatsappUrl(
  exec: OffPlanSalesExecutive
): string | null {
  if (exec.useWhatsappBusinessApi && exec.companyWhatsappUrl) {
    return exec.companyWhatsappUrl;
  }
  if (!exec.phone) return null;
  const digits = exec.phone.replace(/\D/g, "");
  if (!digits) return null;
  const text = exec.message ? encodeURIComponent(exec.message) : "";
  return text
    ? `https://wa.me/${digits}?text=${text}`
    : `https://wa.me/${digits}`;
}

export function offPlanSalesExecMailto(exec: OffPlanSalesExecutive): string | null {
  if (!exec.email) return null;
  if (exec.message) {
    return `mailto:${exec.email}?body=${encodeURIComponent(exec.message)}`;
  }
  return `mailto:${exec.email}`;
}
