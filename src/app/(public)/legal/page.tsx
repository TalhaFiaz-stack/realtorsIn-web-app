import Link from "next/link";

export const metadata = {
  title: "Legal",
};

export default function LegalIndexPage() {
  return (
    <main className="mx-auto max-w-2xl px-6 py-16">
      <h1 className="text-2xl font-semibold">Legal</h1>
      <ul className="mt-6 space-y-3 text-sm">
        <li>
          <Link className="text-primary hover:underline" href="/legal/terms">
            Terms &amp; Conditions
          </Link>
        </li>
        <li>
          <Link className="text-primary hover:underline" href="/legal/privacy">
            Privacy Policy
          </Link>
        </li>
      </ul>
      <p className="mt-8 text-sm text-muted-foreground">
        Live policy URLs are loaded from{" "}
        <code className="rounded bg-muted px-1">GET /api/login/legal-pages</code>{" "}
        in Phase 2.
      </p>
    </main>
  );
}
