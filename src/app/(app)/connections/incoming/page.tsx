import { Suspense } from "react";
import { ConnectionsScreen } from "@/components/network/connections-screen";
import { NetworkPageSkeleton } from "@/components/states/list-row-skeleton";

export const metadata = { title: "Incoming requests" };

export default function IncomingConnectionsPage() {
  return (
    <Suspense fallback={<NetworkPageSkeleton />}>
      <ConnectionsScreen />
    </Suspense>
  );
}
