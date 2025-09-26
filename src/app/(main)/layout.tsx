import Navbar from "@/components/layouts/navbar";
import { serverWebsiteService } from "@/lib/api/services/websiteService";
import Footer from "@/components/layouts/footer";
import { getDiscordStatus } from "@/lib/helpers/statusHelper";
import Hero from "@/components/layouts/hero";

export default async function MainLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const websiteService = serverWebsiteService();
  
  const { website } = await websiteService.verifyLicenseKey({
    key: process.env.NEXT_PUBLIC_LICENSE_KEY || "",
  });

  // Server bilgilerini güvenli şekilde al
  const servers = website.servers || [];
  const mainServer = servers.find((server) => server.port === 25565) || servers[0];
  
  // Eğer server bulunamazsa varsayılan değerler kullan
  const serverConfig = mainServer && mainServer.ip && mainServer.port 
    ? { ip: mainServer.ip, port: mainServer.port }
    : { ip: 'localhost', port: 25565 }; // Fallback değerler

  // Minecraft status will be fetched client-side

  const discordStatus = await getDiscordStatus({
    guildId: website.discord?.guild_id || ""
  }).catch(() => {
    return {
      invite: "#",
      online: 0
    };
  });

  return (
    <div>
      <Navbar websiteName={website.name} navbarLinks={website.theme.navbar} />
      <div className="glide-scroll antialiased pt-16">
        <Hero
          bannerImage={website.theme.header.bannerImage}
          logoImage={website.image}
          socialMedia={website.social_media}
          minecraftServer={serverConfig}
          discordStatus={discordStatus}
        />
        <div className="container mx-auto px-4 py-8 max-w-6xl">
          {children}
        </div>
      </div>
      <Footer
        logoImage={website.image}
        name={website.name}
        description={website.description}
        serverAddress={serverConfig.ip}
        socialMedia={website.social_media}
        quickLinks={website.theme.navbar}
      />
    </div>
  );
}
