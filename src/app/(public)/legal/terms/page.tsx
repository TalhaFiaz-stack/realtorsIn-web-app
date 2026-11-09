import { LegalDocumentView } from "@/components/legal/legal-document";
import { fetchLegalDocument } from "@/features/legal/legal-page.server";

export const metadata = { title: "Terms & Conditions" };
export const revalidate = 86400;

export default async function TermsPage() {
  const doc = await fetchLegalDocument("terms");
  return (
    <LegalDocumentView
      title="Terms & Conditions"
      description="The rules for using RealtorsIn on web and mobile."
      doc={doc}
      otherHref="/legal/privacy"
      otherLabel="Privacy Policy"
    />
  );
}
