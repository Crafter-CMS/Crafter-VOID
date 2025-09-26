import StartToPlay from "./contents/startToPlay";
import FooterLinks from "./contents/footerLinks";
import Copyright from "./contents/copyright";
import { Website } from "@/lib/types/website";

export default function Footer({
  logoImage,
  name,
  description,
  serverAddress,
  socialMedia,
  quickLinks,
  status,
}: {
  logoImage: string;
  name: string;
  description: string;
  serverAddress: string;
  socialMedia: {
    instagram: string;
    tiktok: string;
    github: string;
    twitter: string;
    youtube: string;
    discord: string;
  };
  quickLinks: Website["theme"]["navbar"];
  status?: any;
}) {
  return (
    <footer className="flex-none container mx-auto">
      <StartToPlay serverAddress={serverAddress} status={status} />
      <FooterLinks
        logoImage={logoImage}
        name={name}
        description={description}
        socialMedia={socialMedia}
        quickLinks={quickLinks}
      />
      <div className="flex justify-center items-center px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
        <Copyright name={name} />
      </div>
    </footer>
  );
}
