import { Profile } from "@/components/profile";
import { DefaultBreadcrumb } from "@/components/ui/breadcrumb";
import { serverUserService } from "@/lib/api/services/userService";
import { serverWebsiteService } from "@/lib/api/services/websiteService";
import { Metadata } from "next";
import { headers } from "next/headers";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ username: string }>;
}) {
  const { username } = await params;

  return {
    title: `${username} Profili`,
    description: `${username} isimli oyuncunun profil sayfası`,
  };
}

export default async function ProfilePage({
  params,
}: {
  params: Promise<{ username: string }>;
}) {
  const { username } = await params;
  const headersList = await headers();
  const websiteId = headersList.get("x-website-id") || "default_website_id";
  const website = await serverWebsiteService(websiteId).getWebsite({});
  return (
    <div>
      <DefaultBreadcrumb
        items={[
          { label: "Profil", href: "#" },
          { label: username, href: `/profile/${username}` },
        ]}
      />
      <Profile ownUser={false} username={username} currency={website?.currency} />
    </div>
  );
}
