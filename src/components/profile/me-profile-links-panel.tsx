import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { ME_PROFILE_LINKS } from "@/constants/me-profile-links";

export function MeProfileLinksPanel() {
  return (
    <section className="rounded-[var(--radius)] border border-border bg-card shadow-sm">
      <header className="border-b border-border px-4 py-3">
        <h2 className="text-sm font-semibold text-foreground">Manage profile</h2>
        <p className="text-xs text-muted-foreground">
          Same destinations as the mobile profile hub
        </p>
      </header>
      <ul className="divide-y divide-border">
        {ME_PROFILE_LINKS.map((item) => {
          const Icon = item.icon;
          return (
            <li key={item.href}>
              <Link
                href={item.href}
                className="flex items-center gap-3 px-4 py-3 hover:bg-muted/40"
              >
                <Icon className="h-4 w-4 shrink-0 text-muted-foreground" />
                <span className="min-w-0 flex-1">
                  <span className="block text-sm font-medium text-foreground">
                    {item.label}
                  </span>
                  <span className="block text-xs text-muted-foreground">
                    {item.description}
                  </span>
                </span>
                <ChevronRight className="h-4 w-4 text-muted-foreground" />
              </Link>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
