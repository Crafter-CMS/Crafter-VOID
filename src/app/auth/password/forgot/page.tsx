import { Metadata } from "next";
import ForgotPasswordForm from "@/components/auth/forgotPassForm";
import { serverWebsiteService } from "@/lib/api/services/websiteService";
import { headers } from "next/headers";

export const metadata: Metadata = {
  title: "Şifremi Unuttum",
  description: "Şifrenizi unuttuysanız, e-posta adresinizi girerek şifrenizi sıfırlayabilirsiniz.",
};

export default async function ForgotPasswordPage() {
  const headersList = await headers();
  const websiteId = headersList.get("x-website-id") as string;
  const websiteService = serverWebsiteService(websiteId);
  const website = await websiteService.getWebsite({
    id: websiteId || "",
  });

  const turnstilePublicKey = website.security?.cf_turnstile?.site_key || undefined;
  
  return (
    <ForgotPasswordForm
      bannerImage={website.theme?.header?.bannerImage}
      logo={website.image}
      turnstilePublicKey={turnstilePublicKey}
    />
  );
}
