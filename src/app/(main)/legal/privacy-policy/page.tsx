import { Metadata } from "next";
import {legalService, serverLegalService} from "@/lib/api/services/legalService";
import LegalPage from "@/components/legal-pages";
import { headers } from "next/headers";

export const metadata: Metadata = {
  title: "Gizlilik Politikası",
  description: "Sunucumuzun gizlilik politikasını okuyunuz.",
};

export default async function PrivacyPolicyPage() {
    const headersList = await headers();
    const websiteId = headersList.get("x-website-id") as string;
    const legalDocuments = await serverLegalService(websiteId).getLegalDocuments();
    const privacyPolicy = legalDocuments.privacy_policy;

  return (
    <LegalPage
      title="Gizlilik Politikası"
      description="Sunucumuzun gizlilik politikasını okuyunuz."
      content={privacyPolicy}
    />
  );
}