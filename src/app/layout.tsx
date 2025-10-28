import "./globals.css";
import {serverWebsiteService} from "@/lib/api/services/websiteService";
import {headers} from "next/headers";
import {redirect} from "next/navigation";
import imageLinkGenerate from "@/lib/helpers/imageLinkGenerate";
import {ThemeProvider} from "@/components/theme-provider";
import Providers from "./providers";
import PWARegister from "@/components/pwa-register";
import {FloatingPWAButton} from "@/components/ui/pwa-install-button";

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
            <Providers logo={website.image} websiteId={websiteId}>{children}</Providers>
            <PWARegister/>
            <FloatingPWAButton/>
        </ThemeProvider>
        </body>
        </html>
    );
}
