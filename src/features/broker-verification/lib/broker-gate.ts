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

export type BrokerGateBenefitId =
  | "visuals"
  | "pricing"
  | "inventory"
  | "unit-info"
  | "amenities"
  | "location"
  | "about"
  | "brochures"
  | "developer"
  | "agents";

export type BrokerGateBenefit = {
  id: BrokerGateBenefitId;
  /** Short tab label. */
  label: string;
  title: string;
  description: string;
  /** Screenshot from the mobile app (public/broker-gate). */
  image: string;
  /** Intrinsic size of the screenshot (px). */
  width: number;
  height: number;
  /** Soft background behind the screenshot. */
  tint: string;
};

/**
 * What verified brokers unlock — the same 10 slides (screenshots and copy) as
 * the mobile `BrokerCardWizardModal` ("What You'll Unlock").
 */
export const BROKER_GATE_BENEFITS: ReadonlyArray<BrokerGateBenefit> = [
  { id: "visuals", label: "Visuals", title: "Stunning visuals", description: "Browse high-quality feature images, interior renders and full project galleries.", image: "/broker-gate/media-images.png", width: 365, height: 684, tint: "#FFF7ED" },
  { id: "pricing", label: "Pricing", title: "Units & pricing", description: "See typical unit types, bedroom configurations and price ranges at a glance.", image: "/broker-gate/typical-units.png", width: 362, height: 173, tint: "#ECFDF5" },
  { id: "inventory", label: "Inventory", title: "Available units", description: "Filter by area, price and beds. View every on-sale unit with floor details and per-sqft pricing.", image: "/broker-gate/available-units.png", width: 366, height: 422, tint: "#EFF6FF" },
  { id: "unit-info", label: "Unit info", title: "Unit details", description: "Dive into individual units — exact price, area, floor number and availability.", image: "/broker-gate/unit-details.png", width: 364, height: 201, tint: "#F5F3FF" },
  { id: "amenities", label: "Amenities", title: "Facilities & amenities", description: "Explore amenities — pools, gyms, spas, libraries and more, with photos.", image: "/broker-gate/facilities-and-amenities.png", width: 365, height: 624, tint: "#F0FDFA" },
  { id: "location", label: "Location", title: "Prime location", description: "View the exact map location and distances to landmarks like Dubai Mall and Palm Jumeirah.", image: "/broker-gate/location.png", width: 366, height: 458, tint: "#FEF2F2" },
  { id: "about", label: "About", title: "Project overview", description: "Read detailed descriptions — architecture, lifestyle and what makes the project unique.", image: "/broker-gate/about.png", width: 365, height: 437, tint: "#FFFBEB" },
  { id: "brochures", label: "Brochures", title: "Brochures & documents", description: "Download official project brochures, payment plans and marketing material.", image: "/broker-gate/media-links.png", width: 365, height: 147, tint: "#FFF1F2" },
  { id: "developer", label: "Developer", title: "Developer & sales agency", description: "Access developer profiles, websites, contact emails and office addresses.", image: "/broker-gate/sales-agency.png", width: 364, height: 346, tint: "#F0F9FF" },
  { id: "agents", label: "Agents", title: "Sales executives", description: "Connect directly with agents — WhatsApp or call them in their preferred language.", image: "/broker-gate/sales-executives.png", width: 365, height: 391, tint: "#FAF5FF" },
];
