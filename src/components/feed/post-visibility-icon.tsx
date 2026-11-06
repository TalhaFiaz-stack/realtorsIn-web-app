import { cn } from "@/lib/utils";

/** Mobile `SVG.publicIcon` — filled globe used on feed headers. */
function PublicVisibilityIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={cn("h-3 w-3 shrink-0 fill-current", className)}
      aria-hidden
    >
      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10s10-4.48 10-10S17.52 2 12 2M4 12c0-.61.08-1.21.21-1.78L8.99 15v1c0 1.1.9 2 2 2v1.93C7.06 19.43 4 16.07 4 12m13.89 5.4c-.26-.81-1-1.4-1.9-1.4h-1v-3c0-.55-.45-1-1-1h-6v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41C17.92 5.77 20 8.65 20 12c0 2.08-.81 3.98-2.11 5.4" />
    </svg>
  );
}

/** Mobile `SVG.connectionsIcon` — people mark for connections-only posts. */
function ConnectionsVisibilityIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 640 512"
      className={cn("h-3 w-3.5 shrink-0 fill-current", className)}
      aria-hidden
    >
      <path d="M192 256c61.9 0 112-50.1 112-112S253.9 32 192 32S80 82.1 80 144s50.1 112 112 112m76.8 32h-8.3c-20.8 10-43.9 16-68.5 16s-47.6-6-68.5-16h-8.3C51.6 288 0 339.6 0 403.2V432c0 26.5 21.5 48 48 48h288c26.5 0 48-21.5 48-48v-28.8c0-63.6-51.6-115.2-115.2-115.2M480 256c53 0 96-43 96-96s-43-96-96-96s-96 43-96 96s43 96 96 96m48 32h-3.8c-13.9 4.8-28.6 8-44.2 8s-30.3-3.2-44.2-8H432c-20.4 0-39.2 5.9-55.7 15.4c24.4 26.3 39.7 61.2 39.7 99.8v38.4c0 2.2-.5 4.3-.6 6.4H592c26.5 0 48-21.5 48-48c0-61.9-50.1-112-112-112" />
    </svg>
  );
}

export function PostVisibilityIcon({
  visibility,
  className,
}: {
  visibility: string | null | undefined;
  className?: string;
}) {
  const isPublic = String(visibility || "").toLowerCase() === "public";
  return isPublic ? (
    <PublicVisibilityIcon className={className} />
  ) : (
    <ConnectionsVisibilityIcon className={className} />
  );
}

export function postVisibilityLabel(visibility: string | null | undefined) {
  return String(visibility || "").toLowerCase() === "public"
    ? "Public"
    : "Connections";
}
