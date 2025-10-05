import { Metadata } from "next";
import { serverVoteService } from "@/lib/api/services/voteService";
import VoteProviders from "@/components/vote/VoteProviders";
import VoteInfo from "@/components/vote/VoteInfo";
import { DefaultBreadcrumb } from "@/components/ui/breadcrumb";
import Title from "@/components/ui/title";
import { headers } from "next/headers";

export const metadata: Metadata = {
  title: "Oy Ver",
  description: "Minecraft sunucumuz için oy verin ve ödüller kazanın!",
};

async function getVoteProviders(websiteId: string) {
  const voteService = serverVoteService(websiteId);
  try {
    const response = await voteService.getVoteProviders();
    return response.providers || [];
  } catch (error) {
    console.error("Error getting vote providers:", error);
    return [];
  }
}

export default async function VotePage() {
  const headersList = await headers();
  const websiteId = headersList.get("x-website-id") as string;

  const providers = await getVoteProviders(websiteId);

  return (
    <div>
      <div className="flex flex-col gap-4">
        <DefaultBreadcrumb items={[{ label: "Oy Ver", href: "/vote" }]} />
        
        <VoteInfo />
        
        <Title
          title="Vote Provider'lar"
          description="Minecraft sunucumuz için oy verin ve ödüller kazanın!"
        />
        
        <VoteProviders providers={providers} />
      </div>
    </div>
  );
}
