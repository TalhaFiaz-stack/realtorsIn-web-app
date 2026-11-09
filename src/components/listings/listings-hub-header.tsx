import { Building2 } from "lucide-react";
import { HubModuleHeader } from "@/components/hub/hub-module-header";

export function ListingsHubHeader({ action }: { action?: React.ReactNode }) {
  return (
    <HubModuleHeader
      title="Listings"
      subtitle="Off-plan projects, resale and rentals across the UAE"
      icon={Building2}
      action={action}
    />
  );
}
