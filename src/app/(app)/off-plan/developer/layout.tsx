import { BrokerVerifiedRoute } from "@/components/broker-verification/broker-verified-route";

/** Developer pages are only reachable from gated project details. */
export default function OffPlanDeveloperLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <BrokerVerifiedRoute>{children}</BrokerVerifiedRoute>;
}
