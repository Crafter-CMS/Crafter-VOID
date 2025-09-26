import HeroImage from "./contents/image";
import { Website } from "@/lib/types/website";

export default function Hero({
  bannerImage,
  logoImage,
  socialMedia,
  minecraftServer,
  discordStatus,
}: {
  bannerImage: string;
  logoImage: string;
  socialMedia: Website["social_media"];
  minecraftServer: { ip: string; port: number };
  discordStatus: any;
}) {
  return (
    <div className="flex flex-col">
      <HeroImage
        bannerImage={bannerImage}
        logoImage={logoImage}
        socialMedia={socialMedia}
        minecraftServer={minecraftServer}
        discordStatus={discordStatus}
      />
    </div>
  );
}
