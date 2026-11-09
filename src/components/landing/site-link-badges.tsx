import { APP_STORE_LINKS, SOCIAL_LINKS, type SocialNetwork } from "@/constants/site-links";
import { cn } from "@/lib/utils";

/** "Download on the App Store" / "Get it on Google Play" buttons (official store links). */
export function AppStoreBadges({
  className,
  tone = "dark",
}: {
  className?: string;
  /** dark = black badges (light backgrounds); light = white badges (on brand colour). */
  tone?: "dark" | "light";
}) {
  const badge = cn(
    "inline-flex h-12 items-center gap-2.5 rounded-xl px-4 transition-opacity hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50",
    tone === "dark" ? "bg-neutral-950 text-white ring-1 ring-white/10" : "bg-white text-neutral-950"
  );
  return (
    <div className={cn("flex flex-wrap gap-3", className)}>
      <a href={APP_STORE_LINKS.ios} target="_blank" rel="noopener noreferrer" className={badge} aria-label="Download RealtorsIn on the App Store">
        <svg viewBox="0 0 24 24" className="h-6 w-6 shrink-0" fill="currentColor" aria-hidden>
          <path d="M16.37 12.6c-.02-2.2 1.8-3.26 1.88-3.31-1.03-1.5-2.62-1.7-3.19-1.73-1.36-.14-2.65.8-3.34.8-.69 0-1.75-.78-2.88-.76-1.48.02-2.85.86-3.61 2.19-1.54 2.67-.39 6.62 1.11 8.79.73 1.06 1.6 2.25 2.75 2.21 1.1-.04 1.52-.71 2.85-.71 1.33 0 1.71.71 2.88.69 1.19-.02 1.94-1.08 2.67-2.15.84-1.23 1.19-2.42 1.21-2.48-.03-.01-2.32-.89-2.33-3.54zM14.18 6.13c.61-.74 1.02-1.76.91-2.78-.88.04-1.94.59-2.57 1.32-.56.65-1.06 1.69-.93 2.69.98.08 1.98-.5 2.59-1.23z" />
        </svg>
        <span className="text-start leading-none">
          <span className="block text-[10px] opacity-80">Download on the</span>
          <span className="mt-0.5 block text-[15px] font-semibold">App Store</span>
        </span>
      </a>
      <a href={APP_STORE_LINKS.android} target="_blank" rel="noopener noreferrer" className={badge} aria-label="Get RealtorsIn on Google Play">
        <svg viewBox="0 0 24 24" className="h-6 w-6 shrink-0" aria-hidden>
          <path fill="#34A853" d="M3.6 2.3 13.4 12 3.6 21.7c-.37-.2-.6-.6-.6-1.07V3.37c0-.47.23-.87.6-1.07z" />
          <path fill="#FBBC04" d="M16.7 15.3 13.4 12l3.3-3.3 3.7 2.13c1.07.62 1.07 1.72 0 2.34l-3.7 2.13z" />
          <path fill="#EA4335" d="M16.7 15.3 13.4 12 3.6 21.7c.36.2.82.19 1.3-.08l11.8-6.32z" />
          <path fill="#4285F4" d="M16.7 8.7 4.9 2.38c-.48-.27-.94-.28-1.3-.08L13.4 12l3.3-3.3z" />
        </svg>
        <span className="text-start leading-none">
          <span className="block text-[10px] opacity-80">GET IT ON</span>
          <span className="mt-0.5 block text-[15px] font-semibold">Google Play</span>
        </span>
      </a>
    </div>
  );
}

const ICON_PATHS: Record<SocialNetwork, string> = {
  linkedin:
    "M20.45 20.45h-3.56v-5.57c0-1.33-.02-3.04-1.85-3.04-1.86 0-2.14 1.45-2.14 2.94v5.67H9.34V9h3.42v1.56h.05c.48-.9 1.64-1.85 3.37-1.85 3.6 0 4.27 2.37 4.27 5.46v6.28zM5.34 7.43a2.06 2.06 0 1 1 0-4.13 2.06 2.06 0 0 1 0 4.13zM7.12 20.45H3.56V9h3.56v11.45zM22.22 0H1.77C.79 0 0 .77 0 1.73v20.54C0 23.23.79 24 1.77 24h20.45c.98 0 1.78-.77 1.78-1.73V1.73C24 .77 23.2 0 22.22 0z",
  instagram:
    "M12 2.16c3.2 0 3.58.01 4.85.07 1.17.05 1.8.25 2.23.41.56.22.96.48 1.38.9.42.42.68.82.9 1.38.16.42.36 1.06.41 2.23.06 1.27.07 1.65.07 4.85s-.01 3.58-.07 4.85c-.05 1.17-.25 1.8-.41 2.23-.22.56-.48.96-.9 1.38-.42.42-.82.68-1.38.9-.42.16-1.06.36-2.23.41-1.27.06-1.65.07-4.85.07s-3.58-.01-4.85-.07c-1.17-.05-1.8-.25-2.23-.41a3.72 3.72 0 0 1-1.38-.9 3.72 3.72 0 0 1-.9-1.38c-.16-.42-.36-1.06-.41-2.23C2.17 15.58 2.16 15.2 2.16 12s.01-3.58.07-4.85c.05-1.17.25-1.8.41-2.23.22-.56.48-.96.9-1.38.42-.42.82-.68 1.38-.9.42-.16 1.06-.36 2.23-.41C8.42 2.17 8.8 2.16 12 2.16zM12 0C8.74 0 8.33.01 7.05.07 5.78.13 4.9.33 4.14.63a5.88 5.88 0 0 0-2.13 1.38A5.88 5.88 0 0 0 .63 4.14C.33 4.9.13 5.78.07 7.05.01 8.33 0 8.74 0 12s.01 3.67.07 4.95c.06 1.27.26 2.15.56 2.91.3.79.72 1.46 1.38 2.13a5.88 5.88 0 0 0 2.13 1.38c.76.3 1.64.5 2.91.56C8.33 23.99 8.74 24 12 24s3.67-.01 4.95-.07c1.27-.06 2.15-.26 2.91-.56a5.88 5.88 0 0 0 2.13-1.38 5.88 5.88 0 0 0 1.38-2.13c.3-.76.5-1.64.56-2.91.06-1.28.07-1.69.07-4.95s-.01-3.67-.07-4.95c-.06-1.27-.26-2.15-.56-2.91a5.88 5.88 0 0 0-1.38-2.13A5.88 5.88 0 0 0 19.86.63C19.1.33 18.22.13 16.95.07 15.67.01 15.26 0 12 0zm0 5.84a6.16 6.16 0 1 0 0 12.32 6.16 6.16 0 0 0 0-12.32zM12 16a4 4 0 1 1 0-8 4 4 0 0 1 0 8zm6.41-11.85a1.44 1.44 0 1 0 0 2.88 1.44 1.44 0 0 0 0-2.88z",
  facebook:
    "M24 12.07C24 5.4 18.63 0 12 0S0 5.4 0 12.07C0 18.1 4.39 23.1 10.13 24v-8.44H7.08v-3.49h3.05V9.41c0-3.02 1.79-4.69 4.53-4.69 1.31 0 2.68.24 2.68.24v2.97h-1.51c-1.49 0-1.96.93-1.96 1.88v2.26h3.33l-.53 3.49h-2.8V24C19.61 23.1 24 18.1 24 12.07z",
  tiktok:
    "M12.53.02C13.84 0 15.14.01 16.44 0c.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z",
  whatsapp:
    "M17.47 14.38c-.3-.15-1.76-.87-2.03-.97-.27-.1-.47-.15-.67.15-.2.3-.77.97-.94 1.17-.17.2-.35.22-.65.07-.3-.15-1.26-.46-2.4-1.48-.89-.79-1.49-1.77-1.66-2.07-.17-.3-.02-.46.13-.61.13-.13.3-.35.45-.52.15-.17.2-.3.3-.5.1-.2.05-.37-.02-.52-.08-.15-.67-1.62-.92-2.22-.24-.58-.49-.5-.67-.51h-.57c-.2 0-.52.07-.8.37-.27.3-1.04 1.02-1.04 2.48s1.07 2.88 1.22 3.08c.15.2 2.1 3.2 5.08 4.49.71.31 1.26.49 1.69.63.71.23 1.36.2 1.87.12.57-.09 1.76-.72 2-1.41.25-.7.25-1.29.17-1.41-.07-.13-.27-.2-.57-.35zM12.05 21.5h-.01a9.4 9.4 0 0 1-4.8-1.32l-.34-.2-3.57.94.95-3.48-.22-.36a9.43 9.43 0 0 1-1.45-5.03C2.6 6.83 6.84 2.6 12.05 2.6c2.52 0 4.9.99 6.68 2.77a9.37 9.37 0 0 1 2.76 6.67c0 5.2-4.24 9.45-9.44 9.45zm8.04-17.5A11.3 11.3 0 0 0 12.05.67C5.78.67.68 5.77.67 12.04c0 2 .52 3.96 1.52 5.69L.57 23.33l5.73-1.5a11.33 11.33 0 0 0 5.74 1.46h.01c6.27 0 11.37-5.1 11.38-11.37 0-3.04-1.18-5.9-3.34-8.04z",
};

/** Round social icon links (LinkedIn, Instagram, Facebook, TikTok, WhatsApp). */
export function SocialLinks({ className, size = "md" }: { className?: string; size?: "sm" | "md" }) {
  return (
    <ul className={cn("flex flex-wrap gap-2", className)}>
      {SOCIAL_LINKS.map((s) => (
        <li key={s.network}>
          <a
            href={s.href}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={`RealtorsIn on ${s.label}`}
            title={s.label}
            className={cn(
              "flex items-center justify-center rounded-full border border-border bg-card text-muted-foreground transition-colors hover:border-primary/40 hover:text-primary",
              size === "sm" ? "h-8 w-8" : "h-10 w-10"
            )}
          >
            <svg viewBox="0 0 24 24" className={size === "sm" ? "h-3.5 w-3.5" : "h-4 w-4"} fill="currentColor" aria-hidden>
              <path d={ICON_PATHS[s.network]} />
            </svg>
          </a>
        </li>
      ))}
    </ul>
  );
}
