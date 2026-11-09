import {
  Bell,
  BedDouble,
  BriefcaseBusiness,
  Building2,
  CalendarDays,
  Check,
  FileText,
  Heart,
  Home,
  MapPin,
  MessageCircle,
  Paperclip,
  Presentation,
  Repeat2,
  Search,
  Send,
  ShieldCheck,
  Sparkles,
  UserPlus,
  Users,
} from "lucide-react";
import type { ProductFeatureId } from "@/constants/product-tour";
import { cn } from "@/lib/utils";

/**
 * Illustrative "screenshots" of RealtorsIn screens, built from the app's own
 * design tokens with fictional sample data (no real members are shown).
 * They stay sharp at any size and follow light / dark theme.
 */

/* ───────────────────────── shared bits ───────────────────────── */

export function BrowserFrame({
  children,
  url = "realtorsin.com/feed",
  className,
}: {
  children: React.ReactNode;
  url?: string;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "overflow-hidden rounded-2xl border border-border bg-background shadow-[0_24px_60px_-20px_rgba(15,23,42,0.35)] ring-1 ring-black/[0.03] dark:ring-white/[0.06]",
        className
      )}
    >
      <div className="flex items-center gap-2 border-b border-border bg-muted/60 px-3 py-2">
        <span className="flex gap-1.5" aria-hidden>
          <span className="h-2.5 w-2.5 rounded-full bg-[#ff5f57]" />
          <span className="h-2.5 w-2.5 rounded-full bg-[#febc2e]" />
          <span className="h-2.5 w-2.5 rounded-full bg-[#28c840]" />
        </span>
        <span className="mx-auto flex h-6 w-full max-w-xs items-center justify-center rounded-md bg-background px-3 text-[10px] text-muted-foreground">
          {url}
        </span>
        <span className="w-10" aria-hidden />
      </div>
      <div className="bg-muted/30 p-3 sm:p-4">{children}</div>
    </div>
  );
}

const PALETTE = [
  "bg-sky-500",
  "bg-violet-500",
  "bg-amber-500",
  "bg-emerald-500",
  "bg-rose-500",
  "bg-indigo-500",
];

function Face({ name, size = "md", tone = 0 }: { name: string; size?: "sm" | "md" | "lg"; tone?: number }) {
  const initials = name
    .split(" ")
    .slice(0, 2)
    .map((p) => p[0])
    .join("");
  return (
    <span
      className={cn(
        "flex shrink-0 items-center justify-center rounded-full font-semibold text-white",
        PALETTE[tone % PALETTE.length],
        size === "sm" ? "h-6 w-6 text-[9px]" : size === "lg" ? "h-12 w-12 text-sm" : "h-8 w-8 text-[10px]"
      )}
      aria-hidden
    >
      {initials}
    </span>
  );
}

function Card({ children, className }: { children: React.ReactNode; className?: string }) {
  return <div className={cn("rounded-xl border border-border bg-card p-3 text-card-foreground shadow-sm", className)}>{children}</div>;
}

function Line({ w = "w-full", className }: { w?: string; className?: string }) {
  return <span className={cn("block h-1.5 rounded-full bg-muted-foreground/15", w, className)} aria-hidden />;
}

function Verified() {
  return <ShieldCheck className="h-3 w-3 text-emerald-500" aria-label="Verified" />;
}

/** Fake building photo (gradient + shapes) so no external images are needed. */
function Photo({ className, tone = 0 }: { className?: string; tone?: number }) {
  const skies = ["from-sky-300 to-sky-100", "from-amber-200 to-rose-100", "from-indigo-300 to-sky-100"];
  return (
    <div className={cn("relative overflow-hidden rounded-lg bg-gradient-to-b", skies[tone % skies.length], className)} aria-hidden>
      <div className="absolute bottom-0 left-[10%] h-[70%] w-[18%] rounded-t-sm bg-slate-500/80" />
      <div className="absolute bottom-0 left-[32%] h-[92%] w-[14%] rounded-t-sm bg-slate-600/85" />
      <div className="absolute bottom-0 left-[50%] h-[60%] w-[20%] rounded-t-sm bg-slate-400/85" />
      <div className="absolute bottom-0 left-[74%] h-[80%] w-[14%] rounded-t-sm bg-slate-600/75" />
      <div className="absolute inset-x-0 bottom-0 h-[12%] bg-emerald-600/40" />
    </div>
  );
}

/* ───────────────────────── screens ───────────────────────── */

export function FeedPreview() {
  return (
    <div className="space-y-2.5">
      <Card className="flex items-center gap-2.5 py-2.5">
        <Face name="You" tone={5} />
        <span className="flex-1 rounded-full border border-border px-3 py-1.5 text-[11px] text-muted-foreground">
          What’s on your mind, Sara?
        </span>
      </Card>
      <Card className="space-y-2.5">
        <div className="flex items-center gap-2">
          <Face name="Omar Haddad" tone={0} />
          <div className="min-w-0">
            <p className="flex items-center gap-1 text-[11px] font-semibold">Omar Haddad <Verified /></p>
            <p className="text-[10px] text-muted-foreground">Senior Broker · 2h</p>
          </div>
        </div>
        <p className="text-[11px] leading-relaxed">Just listed — 2BR with full Marina view, ready to move. DM for viewing 📩</p>
        <Photo className="h-24 sm:h-28" />
        <div className="flex items-center justify-between rounded-lg bg-muted/50 px-2.5 py-1.5 text-[10px]">
          <span className="font-semibold">AED 2,450,000</span>
          <span className="flex items-center gap-1 text-muted-foreground"><BedDouble className="h-3 w-3" /> 2 · 1,320 sqft · Dubai Marina</span>
        </div>
        <div className="flex items-center justify-between border-t border-border pt-2 text-[10px] font-semibold text-muted-foreground">
          <span className="flex items-center gap-1 text-rose-500"><Heart className="h-3 w-3 fill-current" /> Love</span>
          <span className="flex items-center gap-1"><MessageCircle className="h-3 w-3" /> Comment</span>
          <span className="flex items-center gap-1"><Repeat2 className="h-3 w-3" /> Repost</span>
          <span className="flex items-center gap-1"><Send className="h-3 w-3" /> Send</span>
        </div>
      </Card>
    </div>
  );
}

export function NetworkPreview() {
  const people = [
    ["Lina Farouk", "Leasing Manager · Abu Dhabi"],
    ["Ravi Menon", "Off-plan Specialist · Dubai"],
    ["Hana Saleh", "Broker · Sharjah"],
  ];
  return (
    <div className="space-y-2.5">
      <Card className="space-y-2.5">
        <div className="flex items-center gap-2">
          <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary/10 text-primary"><Users className="h-3.5 w-3.5" /></span>
          <p className="text-[12px] font-semibold">My network</p>
        </div>
        <div className="flex gap-1.5 text-[10px] font-medium">
          <span className="rounded-full bg-primary px-2.5 py-1 text-primary-foreground">Connected 248</span>
          <span className="flex items-center gap-1 rounded-full border border-border px-2.5 py-1">Requests <span className="rounded-full bg-destructive px-1 text-[9px] text-white">3</span></span>
          <span className="rounded-full border border-border px-2.5 py-1">Discover</span>
        </div>
      </Card>
      <div className="grid grid-cols-3 gap-2">
        {people.map(([name, role], i) => (
          <Card key={name} className="flex flex-col items-center gap-1.5 px-2 text-center">
            <Face name={name!} size="lg" tone={i + 1} />
            <p className="flex items-center gap-1 text-[10px] font-semibold">{name} {i !== 1 ? <Verified /> : null}</p>
            <p className="line-clamp-2 text-[9px] text-muted-foreground">{role}</p>
            <span className="mt-0.5 flex w-full items-center justify-center gap-1 rounded-full border border-primary/40 py-1 text-[9px] font-semibold text-primary">
              <UserPlus className="h-3 w-3" /> Connect
            </span>
          </Card>
        ))}
      </div>
    </div>
  );
}

export function OffPlanPreview() {
  return (
    <div className="grid gap-2.5 sm:grid-cols-[1.3fr_1fr]">
      <Card className="space-y-2 p-0">
        <div className="relative">
          <Photo className="h-28 rounded-b-none rounded-t-xl" tone={1} />
          <span className="absolute left-2 top-2 rounded-full bg-white/90 px-2 py-0.5 text-[9px] font-semibold text-neutral-900">On sale</span>
          <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/60 to-transparent p-2 text-white">
            <p className="text-[11px] font-semibold">Azure Bay Residences</p>
            <p className="text-[9px] opacity-85">by Sample Developments</p>
          </div>
        </div>
        <div className="grid grid-cols-3 divide-x divide-border px-1 pb-2 text-center">
          {[["From", "AED 1.2M"], ["Handover", "Q4 2027"], ["Plan", "60/40"]].map(([k, v]) => (
            <div key={k}>
              <p className="text-[8px] uppercase tracking-wide text-muted-foreground">{k}</p>
              <p className="text-[10px] font-semibold">{v}</p>
            </div>
          ))}
        </div>
      </Card>
      <Card className="space-y-2">
        <p className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">Unit 1204</p>
        <p className="text-sm font-bold">AED 1,603,000</p>
        <span className="flex items-center justify-center gap-1 rounded-full bg-primary py-1.5 text-[10px] font-semibold text-primary-foreground">
          <Presentation className="h-3 w-3" /> Create presentation
        </span>
        <span className="flex items-center justify-center gap-1 rounded-full border border-border py-1.5 text-[10px] font-semibold">
          <FileText className="h-3 w-3" /> Create quotation
        </span>
        <p className="flex items-center gap-1 text-[9px] text-muted-foreground"><MapPin className="h-3 w-3" /> Dubai Creek Harbour</p>
      </Card>
    </div>
  );
}

export function PropertiesPreview() {
  return (
    <div className="space-y-2.5">
      <Card className="flex items-center gap-2">
        <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary/10 text-primary"><Home className="h-3.5 w-3.5" /></span>
        <p className="flex-1 text-[12px] font-semibold">Property Hub</p>
        <div className="flex gap-1 text-[9px] font-medium">
          <span className="rounded-full bg-primary px-2 py-0.5 text-primary-foreground">Buy</span>
          <span className="rounded-full border border-border px-2 py-0.5">Sell</span>
          <span className="rounded-full border border-border px-2 py-0.5">Rent</span>
        </div>
      </Card>
      <Card className="space-y-2">
        <div className="flex items-center justify-between">
          <span className="rounded-full bg-emerald-500/15 px-2 py-0.5 text-[9px] font-semibold uppercase text-emerald-700 dark:text-emerald-300">Client requirement</span>
          <span className="rounded-full border border-border px-2 py-0.5 text-[9px]">Active</span>
        </div>
        <p className="text-[11px] font-semibold">Looking to buy a 3BR villa in Arabian Ranches</p>
        <p className="text-[10px] text-muted-foreground">Budget AED 3.5M – 4.2M · Ready</p>
        <span className="flex items-center justify-center gap-1 rounded-full bg-primary/10 py-1.5 text-[10px] font-semibold text-primary">
          <Sparkles className="h-3 w-3" /> Find matching properties
        </span>
      </Card>
      <div className="grid grid-cols-2 gap-2">
        {[["94% match", "Villa · Ranches 2"], ["88% match", "Villa · Saheel"]].map(([m, t], i) => (
          <Card key={m} className="space-y-1.5 p-2">
            <Photo className="h-12" tone={i} />
            <p className="text-[9px] font-semibold text-emerald-600 dark:text-emerald-400">{m}</p>
            <p className="text-[9px] text-muted-foreground">{t}</p>
          </Card>
        ))}
      </div>
    </div>
  );
}

export function MessagesPreview() {
  return (
    <Card className="space-y-2.5">
      <div className="flex items-center gap-2 border-b border-border pb-2">
        <Face name="Lina Farouk" tone={1} />
        <div>
          <p className="text-[11px] font-semibold">Lina Farouk</p>
          <p className="text-[9px] text-emerald-600">● Online</p>
        </div>
      </div>
      <div className="space-y-2 text-[10px]">
        <p className="max-w-[75%] rounded-2xl rounded-bl-sm bg-muted px-3 py-2">Hi! Is the Marina 2BR still available for a viewing this week?</p>
        <div className="ms-auto max-w-[75%] space-y-1.5">
          <div className="rounded-2xl rounded-br-sm bg-primary px-3 py-2 text-primary-foreground">Yes — sharing the details now 👇</div>
          <div className="rounded-xl border border-border bg-background p-2">
            <Photo className="h-12" />
            <p className="mt-1 font-semibold">2BR · Dubai Marina</p>
            <p className="text-muted-foreground">AED 2,450,000</p>
          </div>
        </div>
        <p className="max-w-[60%] rounded-2xl rounded-bl-sm bg-muted px-3 py-2">Perfect, Thursday 5pm works 👍</p>
      </div>
      <div className="flex items-center gap-2 rounded-full border border-border px-3 py-1.5 text-[10px] text-muted-foreground">
        <Paperclip className="h-3 w-3" /> Write a message… <Send className="ms-auto h-3 w-3 text-primary" />
      </div>
    </Card>
  );
}

export function JobsEventsPreview() {
  return (
    <div className="grid gap-2.5 sm:grid-cols-2">
      <Card className="space-y-2">
        <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-sky-500/10 text-sky-600"><BriefcaseBusiness className="h-3.5 w-3.5" /></span>
        <p className="text-[11px] font-semibold">Off-plan Sales Consultant</p>
        <p className="text-[10px] text-muted-foreground">Sample Realty · Dubai · Full-time</p>
        <div className="flex flex-wrap gap-1 text-[9px]">
          {["Off-plan", "Negotiation", "Arabic"].map((s) => (
            <span key={s} className="rounded-full border border-border px-2 py-0.5">{s}</span>
          ))}
        </div>
        <span className="flex items-center justify-center rounded-full bg-primary py-1.5 text-[10px] font-semibold text-primary-foreground">Easy Apply</span>
      </Card>
      <Card className="space-y-2 p-0">
        <Photo className="h-16 rounded-b-none rounded-t-xl" tone={2} />
        <div className="space-y-1.5 px-3 pb-3">
          <p className="text-[9px] font-semibold uppercase tracking-wide text-muted-foreground">Networking</p>
          <p className="text-[11px] font-semibold">Brokers Breakfast — Downtown</p>
          <p className="flex items-center gap-1 text-[10px] text-muted-foreground"><CalendarDays className="h-3 w-3" /> Thu, 9:00 AM · 42 going</p>
          <span className="flex items-center justify-center gap-1 rounded-full border border-emerald-600/30 bg-emerald-500/10 py-1.5 text-[10px] font-semibold text-emerald-700 dark:text-emerald-300">
            <Check className="h-3 w-3" /> You’re registered
          </span>
        </div>
      </Card>
    </div>
  );
}

export function ProfilePreview() {
  return (
    <Card className="space-y-3 p-0">
      <div className="h-14 rounded-t-xl bg-gradient-to-r from-primary/70 to-sky-300" aria-hidden />
      <div className="-mt-9 space-y-2 px-3 pb-3">
        <span className="inline-block rounded-full border-4 border-card"><Face name="Sara Khan" size="lg" tone={4} /></span>
        <p className="flex items-center gap-1 text-[12px] font-semibold">Sara Khan <Verified /></p>
        <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/15 px-2 py-0.5 text-[9px] font-semibold text-emerald-700 dark:text-emerald-300">
          <ShieldCheck className="h-3 w-3" /> Verified broker
        </span>
        <p className="text-[10px] text-muted-foreground">Luxury Property Advisor · Palm Jumeirah</p>
        <div className="grid grid-cols-3 gap-1.5 text-center">
          {[["312", "Profile views"], ["4.8K", "Impressions"], ["248", "Connections"]].map(([v, l]) => (
            <div key={l} className="rounded-lg bg-muted/60 py-1.5">
              <p className="text-[11px] font-bold">{v}</p>
              <p className="text-[8px] text-muted-foreground">{l}</p>
            </div>
          ))}
        </div>
        <div className="space-y-1.5 rounded-lg border border-border p-2">
          <p className="text-[9px] font-semibold uppercase tracking-wide text-muted-foreground">Experience</p>
          <div className="flex items-center gap-2">
            <span className="flex h-6 w-6 items-center justify-center rounded-md bg-sky-500/15 text-[8px] font-bold text-sky-700">SR</span>
            <div className="flex-1 space-y-1"><Line w="w-2/3" /><Line w="w-1/3" /></div>
          </div>
        </div>
      </div>
    </Card>
  );
}

/** Hero composite: feed + notification toast + chat bubble. */
export function HeroPreview() {
  return (
    <div className="relative">
      <BrowserFrame url="realtorsin.com/feed">
        <div className="grid gap-3 sm:grid-cols-[9rem_1fr]">
          <div className="hidden space-y-2 sm:block">
            <Card className="flex flex-col items-center gap-1 text-center">
              <Face name="Sara Khan" size="lg" tone={4} />
              <p className="flex items-center gap-1 text-[10px] font-semibold">Sara Khan <Verified /></p>
              <p className="text-[9px] text-muted-foreground">Property Advisor</p>
            </Card>
            <Card className="space-y-1.5 p-2 text-[10px]">
              {[[Home, "Feed"], [Users, "Network"], [Building2, "Off-plan"], [BriefcaseBusiness, "Jobs"]].map(([Icon, label]) => {
                const I = Icon as typeof Home;
                return (
                  <p key={label as string} className="flex items-center gap-1.5 text-muted-foreground"><I className="h-3 w-3" /> {label as string}</p>
                );
              })}
            </Card>
          </div>
          <FeedPreview />
        </div>
      </BrowserFrame>
      <div className="absolute -right-2 top-16 hidden w-52 rounded-xl border border-border bg-popover p-2.5 text-popover-foreground shadow-xl sm:block lg:-right-8">
        <p className="mb-1.5 flex items-center gap-1 text-[10px] font-semibold"><Bell className="h-3 w-3 text-primary" /> Notifications</p>
        <div className="flex items-start gap-2 text-[10px]">
          <Face name="Ravi Menon" size="sm" tone={2} />
          <p><span className="font-semibold">Ravi Menon</span> accepted your connection request</p>
        </div>
      </div>
      <div className="absolute -bottom-5 -left-3 hidden w-48 rounded-xl border border-border bg-popover p-2.5 text-popover-foreground shadow-xl sm:block lg:-left-8">
        <div className="flex items-center gap-2 text-[10px]">
          <Face name="Lina Farouk" size="sm" tone={1} />
          <p className="flex-1"><span className="font-semibold">Lina</span>: Is the Marina 2BR available? </p>
        </div>
        <p className="mt-1.5 flex items-center gap-1 text-[9px] text-muted-foreground"><Search className="h-3 w-3" /> New message</p>
      </div>
    </div>
  );
}

const PREVIEWS: Record<ProductFeatureId, { node: () => React.ReactNode; url: string }> = {
  feed: { node: FeedPreview, url: "realtorsin.com/feed" },
  network: { node: NetworkPreview, url: "realtorsin.com/connections" },
  offplan: { node: OffPlanPreview, url: "realtorsin.com/off-plan" },
  properties: { node: PropertiesPreview, url: "realtorsin.com/properties" },
  messages: { node: MessagesPreview, url: "realtorsin.com/messages" },
  "jobs-events": { node: JobsEventsPreview, url: "realtorsin.com/jobs" },
  profile: { node: ProfilePreview, url: "realtorsin.com/me" },
};

export function FeaturePreview({ id, className }: { id: ProductFeatureId; className?: string }) {
  const p = PREVIEWS[id];
  const Node = p.node;
  return (
    <BrowserFrame url={p.url} className={className}>
      <Node />
    </BrowserFrame>
  );
}
