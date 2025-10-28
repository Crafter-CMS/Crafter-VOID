import Support from "@/components/support";
import {DefaultBreadcrumb} from "@/components/ui/breadcrumb";
import {Metadata} from "next";

export const metadata: Metadata = {
    title: "Destek",
    description: "Destek sayfası",
};

export default function SupportPage() {
    return (
        <div className="flex flex-col gap-4">
            <DefaultBreadcrumb items={[{label: "Destek", href: "/support"}]}/>
            <Support/>
        </div>
    );
}