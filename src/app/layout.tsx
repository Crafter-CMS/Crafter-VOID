import "./globals.css";
import { serverWebsiteService } from "@/lib/api/services/websiteService";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import imageLinkGenerate from "@/lib/helpers/imageLinkGenerate";
import { ThemeProvider } from "@/components/theme-provider";
import Providers from "./providers";
import PWARegister from "@/components/pwa-register";
import { FloatingPWAButton } from "@/components/ui/pwa-install-button";

export async function generateMetadata() {
  const headersList = await headers();
  const websiteId = headersList.get("x-website-id") as string;

  const websiteService = serverWebsiteService(websiteId);

  const website = await websiteService.getWebsite({
    id: websiteId || "",
  });
  return {
    title: {
      template: `%s | ${website.name}`,
      default: `${website.name}`,
    },
    icons: {
      icon: imageLinkGenerate(website.favicon),
      shortcut: imageLinkGenerate(website.favicon),
    },
    description: website.description,
    manifest: "/manifest.json",
    appleWebApp: {
      capable: true,
      statusBarStyle: "default",
      title: website.name,
    },
    formatDetection: {
      telephone: false,
    },
  };
}

export async function generateViewport() {
  return {
    themeColor: "#000000",
    colorScheme: "light dark",
    width: "device-width",
    initialScale: 1,
    maximumScale: 1,
  };
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const headersList = await headers();
  const websiteId = headersList.get("x-website-id") as string;
  const websiteService = serverWebsiteService(websiteId as string);
  const website = await websiteService.getWebsite({
    id: websiteId || "",
  });
  const pathname = headersList.get("x-current-path");

  if (pathname === "/") {
    redirect("/home");
  }

  return (
    <html lang="en" className="glide-scroll antialiased">
      <body className="glide-scroll antialiased">
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <Providers logo={website.image} websiteId={websiteId}>
            {children}
          </Providers>
          <PWARegister />
          <FloatingPWAButton />
        </ThemeProvider>
        {website.tawkto?.isActive &&
          website.tawkto?.propertyId &&
          website.tawkto?.chatId && (
            <script
              type="text/javascript"
              dangerouslySetInnerHTML={{
                __html: `
                var Tawk_API=Tawk_API||{}, Tawk_LoadStart=new Date();
                (function(){
                var s1=document.createElement("script"),s0=document.getElementsByTagName("script")[0];
                s1.async=true;
                s1.src='https://embed.tawk.to/${website.tawkto.propertyId}/${website.tawkto.chatId}';
                s1.charset='UTF-8';
                s1.setAttribute('crossorigin','*');
                s0.parentNode.insertBefore(s1,s0);
                })();
              `,
              }}
            />
          )}
      </body>
    </html>
  );
}
