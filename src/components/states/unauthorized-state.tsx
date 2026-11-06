import Link from "next/link";
import { ShieldAlert } from "lucide-react";
import { Button } from "@/components/ui/button";

export function UnauthorizedState({
  nextPath = "/feed",
}: {
  nextPath?: string;
}) {
  const href = `/login?next=${encodeURIComponent(nextPath)}`;
  return (
    <div
      role="status"
      className="flex min-h-48 flex-col items-center justify-center gap-3 rounded-xl border border-border bg-card px-6 py-10 text-center"
    >
      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted">
        <ShieldAlert className="h-5 w-5 text-muted-foreground" aria-hidden />
      </div>
      <div className="space-y-1">
        <h3 className="text-base font-semibold">Sign in required</h3>
        <p className="max-w-sm text-sm text-muted-foreground">
          Your session is missing or expired. Sign in to continue.
        </p>
      </div>
      <Button asChild>
        <Link href={href}>Sign in</Link>
      </Button>
    </div>
  );
}
