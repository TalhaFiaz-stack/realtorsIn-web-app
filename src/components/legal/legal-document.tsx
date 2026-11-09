import Link from "next/link";
import { ArrowLeft, ExternalLink, FileText } from "lucide-react";
import type { LegalDocument } from "@/features/legal/legal-page.server";

/** Shell for Terms / Privacy: header, rendered policy, and graceful fallback. */
export function LegalDocumentView({
  title,
  description,
  doc,
  otherHref,
  otherLabel,
}: {
  title: string;
  description: string;
  doc: LegalDocument;
  otherHref: string;
  otherLabel: string;
}) {
  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-10 sm:px-6 sm:py-14">
      <Link
        href="/legal"
        className="inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" aria-hidden />
        Legal
      </Link>
      <header className="mt-4 flex items-start gap-3">
        <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
          <FileText className="h-5 w-5" aria-hidden />
        </span>
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">{title}</h1>
          <p className="mt-1 text-sm text-muted-foreground">{description}</p>
        </div>
      </header>

      <article className="mt-8 rounded-2xl border border-border bg-card p-5 shadow-sm sm:p-8">
        {doc.html ? (
          <div
            className="text-[15px] leading-relaxed text-foreground/90 [&_a]:font-medium [&_a]:text-primary [&_a:hover]:underline [&_h1]:mb-3 [&_h1]:text-2xl [&_h1]:font-semibold [&_h2]:mb-2 [&_h2]:mt-8 [&_h2]:border-t [&_h2]:border-border/70 [&_h2]:pt-6 [&_h2]:text-lg [&_h2]:font-semibold [&_h2]:text-foreground [&_h2:first-child]:mt-0 [&_h2:first-child]:border-0 [&_h2:first-child]:pt-0 [&_h3]:mb-1.5 [&_h3]:mt-5 [&_h3]:font-semibold [&_h3]:text-foreground [&_li]:mt-1 [&_ol]:ms-5 [&_ol]:list-decimal [&_p]:mt-3 [&_strong]:font-semibold [&_strong]:text-foreground [&_ul]:ms-5 [&_ul]:mt-2 [&_ul]:list-disc"
            // Sanitised server-side (scripts, styles, handlers removed).
            dangerouslySetInnerHTML={{ __html: doc.html }}
          />
        ) : (
          <div className="py-6 text-center">
            <p className="text-sm text-muted-foreground">
              We couldn’t load this document right now.
            </p>
            <a
              href={doc.sourceUrl}
              target="_blank"
              rel="noreferrer"
              className="mt-3 inline-flex items-center gap-1.5 text-sm font-semibold text-primary hover:underline"
            >
              Open the {title.toLowerCase()} in a new tab
              <ExternalLink className="h-4 w-4" aria-hidden />
            </a>
          </div>
        )}
      </article>

      <p className="mt-6 text-sm text-muted-foreground">
        See also{" "}
        <Link href={otherHref} className="font-medium text-primary hover:underline">
          {otherLabel}
        </Link>
        .
      </p>
    </main>
  );
}
