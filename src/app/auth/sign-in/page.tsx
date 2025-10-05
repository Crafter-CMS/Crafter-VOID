import { Metadata } from "next";
import SignInForm from "@/components/auth/signInForm";
import { serverWebsiteService } from "@/lib/api/services/websiteService";
import { headers } from "next/headers";

export const metadata: Metadata = {
  title: "Giriş Yap",
  description: "Bilgilerinizi girerek giriş yapabilirsiniz.",
};

export default async function SignIn({ searchParams }: { searchParams: Promise<{ return: string }> }) {
  const headersList = await headers();
  const websiteId = headersList.get("x-website-id") as string;
  const websiteService = serverWebsiteService(websiteId);
  const website = await websiteService.getWebsite({
    id: websiteId || "",
  });

  const turnstilePublicKey = website.security?.cf_turnstile?.site_key || undefined;
  const returnUrl = (await searchParams).return || undefined;
  
  return (
    <SignInForm
      bannerImage={website.theme?.header?.bannerImage}
      logo={website.image}
      turnstilePublicKey={turnstilePublicKey}
      returnUrl={returnUrl}
    />
  );
}
