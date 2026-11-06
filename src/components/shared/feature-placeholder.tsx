import { EmptyState } from "@/components/states/empty-state";
import { Badge } from "@/components/ui/badge";

export function FeaturePlaceholder({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <h1 className="text-2xl font-semibold tracking-tight">{title}</h1>
        <Badge variant="muted">Coming soon</Badge>
      </div>
      <EmptyState
        title={`${title} is not available yet`}
        description={
          description ||
          "This area ships in a later phase. Use Home, Network, Messages, or Notifications for live features."
        }
      />
    </div>
  );
}
