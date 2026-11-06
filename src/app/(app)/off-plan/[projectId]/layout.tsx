import { BrokerVerifiedRoute } from "@/components/broker-verification/broker-verified-route";

/** Verified-broker gate for project detail, units and unit detail (mobile parity). */
export default function OffPlanProjectLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <BrokerVerifiedRoute>{children}</BrokerVerifiedRoute>;
}
