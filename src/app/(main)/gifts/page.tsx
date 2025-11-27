import { DefaultBreadcrumb } from "@/components/ui/breadcrumb";
import { serverWebsiteService } from "@/lib/api/services/websiteService";
import { Metadata } from "next";
import { headers } from "next/headers";
import GiftPage from "@/components/gift";

export const metadata: Metadata = {
    title: "Hediye Gönder",
    description: "Başka kullanıcılara hediye gönderin",
};

export default async function GiftsPage() {
    const headersList = await headers();
    const websiteId = headersList.get("x-website-id") || "default_website_id";
    const website = await serverWebsiteService(websiteId).getWebsite({});
    
    return (
        <div>
            <DefaultBreadcrumb items={[{ label: "Hediye Gönder", href: "/gifts" }]} />
            <GiftPage currency={website?.currency} />
        </div>
    );
}
