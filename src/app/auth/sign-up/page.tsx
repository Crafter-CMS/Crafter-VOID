import { Metadata } from "next";
import SignUpForm from "@/components/auth/signUpForm";
import { serverWebsiteService } from "@/lib/api/services/websiteService";
import { headers } from "next/headers";

export const metadata: Metadata = {
  title: "Kayıt Ol",
  description: "Hesabınızı oluşturarak kayıt olabilirsiniz.",
};

export default async function SignUp() {
  const headersList = await headers();
  const websiteId = headersList.get("x-website-id") as string;
  const websiteService = serverWebsiteService(websiteId);
  const website = await websiteService.getWebsite({
    id: websiteId || "",
  });

  const turnstilePublicKey = website.security?.cf_turnstile?.site_key || undefined;

  return (
    <SignUpForm
      bannerImage={website.theme?.header?.bannerImage}
      logo={website.image}
      turnstilePublicKey={turnstilePublicKey}
    />
  );
}
