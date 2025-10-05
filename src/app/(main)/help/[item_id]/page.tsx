import HelpItem from "@/components/help/item";
import { serverHelpService } from "@/lib/api/services/helpService";
import {lexicalToString} from "@/lib/helpers/lexicalToString";
import {headers} from "next/headers";


export async function generateMetadata({params}: { params: Promise<{ item_id: string }> }) {
    const headersList = await headers();
    const websiteId = headersList.get("x-website-id") as string;
    const helpService = await serverHelpService(websiteId);

    const item = await helpService.getItem({itemId: (await params).item_id});
    return {
        title: item.title,
        description: lexicalToString(item.content),
    };
}

export default async function HelpItemPage({params}: { params: Promise<{ item_id: string }> }) {
    const headersList = await headers();
    const websiteId = headersList.get("x-website-id") as string;
    const helpService = await serverHelpService(websiteId);

    const item = await helpService.getItem({itemId: (await params).item_id});
    return <HelpItem item={item}/>;
}