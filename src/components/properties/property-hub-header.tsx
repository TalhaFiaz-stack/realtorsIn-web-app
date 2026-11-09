import { House } from "lucide-react";
import { HubModuleHeader } from "@/components/hub/hub-module-header";

export function PropertyHubHeader({ action }: { action?: React.ReactNode }) {
  return (
    <HubModuleHeader
      title="Property Hub"
      subtitle="Manage your buy, sell and rent listings"
      icon={House}
      action={action}
    />
  );
}
