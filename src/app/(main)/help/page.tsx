import {Metadata} from "next";
import Help from "@/components/help/index";
import {serverWebsiteService} from "@/lib/api/services/websiteService";
import {headers} from 'next/headers'

export const metadata: Metadata = {
    title: "Yardım",
    description: "Yardım",
};

export default async function HelpPage() {
    const headersList = await headers();
    const websiteId = headersList.get("x-website-id") || "default_website_id";
    const website = await serverWebsiteService(websiteId).getWebsite({});

    return <Help discordLink={website.social_media.discord ?? ""}/>;
}
