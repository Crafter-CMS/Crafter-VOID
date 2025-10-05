import {Profile} from "@/components/profile";
import {DefaultBreadcrumb} from "@/components/ui/breadcrumb";
import {serverWebsiteService} from "@/lib/api/services/websiteService";
import {Metadata} from "next";
import {headers} from "next/headers";

export const metadata: Metadata = {
    title: "Profilim",
    description: "Profil sayfanız",
};

export default async function ProfilePage() {
    const headersList = await headers();
    const websiteId = headersList.get("x-website-id") || "default_website_id";
    const website = await serverWebsiteService(websiteId).getWebsite({});
    return (
        <div>
            <DefaultBreadcrumb items={[{label: "Profilim", href: "/profile"}]}/>
            <Profile ownUser={true} currency={website?.currency}/>
        </div>
    );
}
