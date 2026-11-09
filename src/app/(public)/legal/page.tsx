import Link from "next/link";
import { ChevronRight, FileText, ShieldCheck } from "lucide-react";

export const metadata = { title: "Legal" };

const DOCS = [
  {
    href: "/legal/terms",
    title: "Terms & Conditions",
    description: "The rules for using RealtorsIn on web and mobile.",
    icon: FileText,
  },
  {
    href: "/legal/privacy",
    title: "Privacy Policy",
    description: "What we collect, how we use it, and the choices you have.",
    icon: ShieldCheck,
  },
];

export default function LegalIndexPage() {
  return (
    <main className="mx-auto w-full max-w-2xl px-4 py-10 sm:px-6 sm:py-14">
      <h1 className="text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">Legal</h1>
      <p className="mt-1 text-sm text-muted-foreground">Policies that apply to your RealtorsIn account.</p>
      <ul className="mt-6 space-y-2">
        {DOCS.map((doc) => (
          <li key={doc.href}>
            <Link
              href={doc.href}
              className="group flex items-center gap-4 rounded-2xl border border-border bg-card p-4 shadow-sm transition-colors hover:bg-muted/40"
            >
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <doc.icon className="h-5 w-5" aria-hidden />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block font-semibold text-foreground">{doc.title}</span>
                <span className="block text-sm text-muted-foreground">{doc.description}</span>
              </span>
              <ChevronRight className="h-5 w-5 text-muted-foreground transition-transform group-hover:translate-x-0.5" aria-hidden />
            </Link>
          </li>
        ))}
      </ul>
    </main>
  );
}
