import type { Metadata } from "next";
import { serverWebsiteService } from "@/lib/api/services/websiteService";
import Posts from "@/components/layouts/posts";
import Statistics from "@/components/layouts/statistics";
import CTA from "@/components/layouts/cta";
import { serverPostsService } from "@/lib/api/services/postsService";
import { headers } from "next/headers";

async function getWebsite() {
  const headersList = await headers();
  const websiteId = headersList.get("x-website-id");

  const websiteService = serverWebsiteService(websiteId as string);
  const website = await websiteService.getWebsite({
    id: websiteId || "",
  });
  
  return website;
}

export async function generateMetadata(): Promise<Metadata> {
  const website = await getWebsite();

  return {
    title: "Anasayfa",
    description: website.description || "Anasayfa",
  };
}

async function getWebsiteStatistics() {
  const headersList = await headers();
  const websiteId = headersList.get("x-website-id") as string;
  const websiteService = serverWebsiteService(websiteId as string);
  const websiteStatistics = await websiteService.getWebsiteStatistics();
  return websiteStatistics;
}

async function getPosts() {
  const headersList = await headers();
  const websiteId = headersList.get("x-website-id") as string;
  const postsService = serverPostsService(websiteId as string);
  const posts = await postsService.getPosts();
  return posts;
}

export default async function Home() {
  const website = await getWebsite();
  const websiteStatistics = await getWebsiteStatistics();
  
  const posts = await getPosts();
  
  return (
    <div>
      <div className="flex flex-col gap-4">
        <Posts posts={posts} />
        <Statistics statistics={websiteStatistics} />
      </div>
      <CTA backgroundImage={website.theme.header.bannerImage} />
    </div>
  );
}
