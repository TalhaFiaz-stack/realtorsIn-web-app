import { Suspense } from "react";
import { ConnectionsScreen } from "@/components/network/connections-screen";
import { NetworkPageSkeleton } from "@/components/states/list-row-skeleton";

export const metadata = { title: "People you may know" };

export default function ConnectionSuggestionsPage() {
  return (
    <Suspense fallback={<NetworkPageSkeleton />}>
      <ConnectionsScreen />
    </Suspense>
  );
}
