import { LegalDocumentView } from "@/components/legal/legal-document";
import { fetchLegalDocument } from "@/features/legal/legal-page.server";

export const metadata = { title: "Privacy Policy" };
export const revalidate = 86400;

export default async function PrivacyPage() {
  const doc = await fetchLegalDocument("privacy");
  return (
    <LegalDocumentView
      title="Privacy Policy"
      description="What we collect, how we use it, and the choices you have."
      doc={doc}
      otherHref="/legal/terms"
      otherLabel="Terms & Conditions"
    />
  );
}
