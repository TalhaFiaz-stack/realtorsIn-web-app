import { cn } from "@/lib/utils";

/** `@username` — profile / left rail / post meta. */
export function ProfileHandle({
  userName,
  className,
}: {
  userName: string | null | undefined;
  className?: string;
}) {
  if (!userName?.trim()) return null;

  return (
    <span className={cn("truncate text-muted-foreground", className)}>
      @{userName.trim()}
    </span>
  );
}
