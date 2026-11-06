import type { BrokerVerificationStatus } from "@/features/broker-verification/types/broker-verification.types";

export type BrokerGateState = "verified" | "unverified" | "pending" | "unknown";

/** Mobile gates project detail on `broker_card_verified`. */
export function resolveBrokerGateState(
  status: BrokerVerificationStatus | null | undefined
): BrokerGateState {
  if (!status) return "unknown";
  if (status.brokerCardVerified) return "verified";
  const s = `${status.verificationStatus} ${status.latestRequest?.status ?? ""}`.toLowerCase();
  if (s.includes("pending")) return "pending";
  return "unverified";
}

/** What verified brokers unlock — mirrors mobile BrokerCardWizardModal slides. */
export const BROKER_GATE_BENEFITS: ReadonlyArray<{ title: string; description: string }> = [
  { title: "Stunning visuals", description: "High-quality renders and full project galleries." },
  { title: "Units & pricing", description: "Typical unit types, bedrooms and price ranges." },
  { title: "Available units", description: "Every on-sale unit with floor details and per-sqft pricing." },
  { title: "Facilities & amenities", description: "Pools, gyms, spas and more with photos." },
  { title: "Prime location", description: "Exact map location and distance to top landmarks." },
  { title: "Brochures & documents", description: "Official brochures, payment plans and marketing material." },
  { title: "Developer & sales agency", description: "Developer profiles, websites, emails and addresses." },
  { title: "Sales executives", description: "Reach agents directly by WhatsApp, call or email." },
];
