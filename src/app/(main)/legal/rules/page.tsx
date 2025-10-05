import { Metadata } from "next";
import {legalService, serverLegalService} from "@/lib/api/services/legalService";
import LegalPage from "@/components/legal-pages";
import {headers} from "next/headers";

export const metadata: Metadata = {
  title: "Kurallar",
  description: "Sunucumuzun kurallarını ve şartlarını okuyunuz.",
};

export default async function RulesPage() {
    const headersList = await headers();
    const websiteId = headersList.get("x-website-id") as string;
    const legalDocuments = await serverLegalService(websiteId).getLegalDocuments();
    const rules = legalDocuments.rules;

  return (
    <LegalPage
      title="Kurallar"
      description="Sunucumuzun kurallarını ve şartlarını okuyunuz."
      content={rules}
    />
  );
}