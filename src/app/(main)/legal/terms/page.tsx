import { Metadata } from "next";
import {legalService, serverLegalService} from "@/lib/api/services/legalService";
import LegalPage from "@/components/legal-pages";
import {headers} from "next/headers";

export const metadata: Metadata = {
  title: "Şartlar ve Koşullar",
  description: "Sunucumuzun şartlarını ve koşullarını okuyunuz.",
};

export default async function TermsPage() {
    const headersList = await headers();
    const websiteId = headersList.get("x-website-id") as string;
    const legalDocuments = await serverLegalService(websiteId).getLegalDocuments();
    const terms = legalDocuments.terms_of_service;

  return (
    <LegalPage
      title="Şartlar ve Koşullar"
      description="Sunucumuzun şartlarını ve koşullarını okuyunuz."
      content={terms}
    />
  );
}