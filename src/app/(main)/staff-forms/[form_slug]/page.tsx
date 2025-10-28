import { DefaultBreadcrumb } from "@/components/ui/breadcrumb";
import { Metadata } from "next";
import { serverStaffFormService } from "@/lib/api/services/staffFormService";
import { notFound } from "next/navigation";
import StaffFormDetail from "@/components/staff-forms/form-detail";
import { headers } from "next/headers";

interface StaffFormPageProps {
  params: Promise<{
    form_slug: string;
  }>;
}

export async function generateMetadata({ params }: StaffFormPageProps): Promise<Metadata> {
  try {
    const headersList = await headers();
    const websiteId = headersList.get("x-website-id") || "default_website_id";
    const form = await serverStaffFormService(websiteId).getForm((await params).form_slug);
    return {
      title: `${form.title} - Başvuru Formu`,
      description: form.description,
    };
  } catch (error) {
    return {
      title: "Başvuru Formu",
      description: "Başvuru formu bulunamadı.",
    };
  }
}

export default async function StaffFormPage({ params }: StaffFormPageProps) {
  try {
    const headersList = await headers();
    const websiteId = headersList.get("x-website-id") || "default_website_id";
    const form = await serverStaffFormService(websiteId).getForm((await params).form_slug);
    
    return (
      <div>
        <DefaultBreadcrumb
          items={[
            { label: "Başvuru Formları", href: "/staff-forms" },
            { label: form.title, href: `/staff-forms/${(await params).form_slug}` },
          ]}
        />
        <StaffFormDetail form={form} />
      </div>
    );
  } catch (error) {
    notFound();
  }
}
