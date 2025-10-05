import { Metadata } from "next";
import ResetPasswordForm from "@/components/auth/resetPassForm";
import { serverWebsiteService } from "@/lib/api/services/websiteService";
import { headers } from "next/headers";

export const metadata: Metadata = {
  title: "Şifremi Sıfırla",
  description: "Şifrenizi güvenle sıfırlayarak hesabınıza tekrar erişin.",
};

export default async function ResetPasswordPage() {
  const headersList = await headers();
  const websiteId = headersList.get("x-website-id") as string;
  const websiteService = serverWebsiteService(websiteId);
  const website = await websiteService.getWebsite({
    id: websiteId || "",
  });
  
  return (
    <ResetPasswordForm
      bannerImage={website.theme?.header?.bannerImage}
      logo={website.image}
    />
  );
}
