import { Metadata } from "next";
import { notFound } from "next/navigation";
import { serverVoteService } from "@/lib/api/services/voteService";
import { serverWebsiteService } from "@/lib/api/services/websiteService";
import { getVoteProviderInfo } from "@/lib/constants/voteProviders";
import VoteProviderPage from "@/components/vote/VoteProviderPage";
import { DefaultBreadcrumb } from "@/components/ui/breadcrumb";
import { WEBSITE_ID } from "@/lib/constants/base";

interface VoteProviderPageProps {
  params: Promise<{
    provider_id: string;
  }>;
}

export async function generateMetadata({ params }: VoteProviderPageProps): Promise<Metadata> {
  const { provider_id } = await params;
  const websiteService = serverWebsiteService();
  const website = await websiteService.getWebsite({
    id: WEBSITE_ID,
  });

  const providers = await getVoteProviders();
  const providerInfo = providers.find(p => p.id === provider_id);

  return {
    title: `${getVoteProviderInfo(providerInfo?.type || "")?.name || provider_id} - Oy Ver`,
    description: `${getVoteProviderInfo(providerInfo?.type || "")?.name || provider_id} üzerinden oy verin ve ödüller kazanın!`,
  };
}

async function getVoteProviders() {
  const voteService = serverVoteService();
  try {
    const response = await voteService.getVoteProviders();
    return response.providers || [];
  } catch (error) {
    console.error("Error getting vote providers:", error);
    return [];
  }
}

export default async function VoteProviderPageRoute({ params }: VoteProviderPageProps) {
  const { provider_id } = await params;
  const providers = await getVoteProviders();
  
  const provider = providers.find(p => p.id === provider_id);
  
  if (!provider) {
    notFound();
  }

  const providerInfo = getVoteProviderInfo(provider.type);

  return (
    <div>
      <div className="flex flex-col gap-4">
        <DefaultBreadcrumb 
          items={[
            { label: "Oy Ver", href: "/vote" },
            { label: providerInfo?.name || provider.name, href: `/vote/${provider.id}` }
          ]} 
        />
        
        <VoteProviderPage 
          provider={provider}
          providerInfo={providerInfo}
        />
      </div>
    </div>
  );
}
