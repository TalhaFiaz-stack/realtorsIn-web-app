import { Suspense } from "react";
import { ConnectionsScreen } from "@/components/network/connections-screen";
import { NetworkPageSkeleton } from "@/components/states/list-row-skeleton";

export const metadata = { title: "Sent requests" };

export default function SentConnectionsPage() {
  return (
    <Suspense fallback={<NetworkPageSkeleton />}>
      <ConnectionsScreen />
    </Suspense>
  );
}
