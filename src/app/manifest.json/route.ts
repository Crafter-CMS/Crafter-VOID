import { NextRequest, NextResponse } from "next/server";
import { serverWebsiteService } from "@/lib/api/services/websiteService";
import imageLinkGenerate from "@/lib/helpers/imageLinkGenerate";
import { headers } from "next/headers";

export async function GET(request: NextRequest) {
  try {
    const headersList = await headers();
    const websiteId = headersList.get("x-website-id") as string;
    const websiteService = serverWebsiteService(websiteId);
    const website = await websiteService.getWebsite({
      id: websiteId || "",
    });

    const manifest = {
      name: website.name,
      short_name: website.name,
      description: website.description || "Minecraft projeleri için modern web platformu",
      start_url: "/home",
      scope: "/",
      display: "standalone",
      background_color: "#ffffff",
      theme_color: "#000000",
      orientation: "portrait-primary",
      icons: [
        {
          src: imageLinkGenerate(website.favicon),
          sizes: "72x72",
          type: "image/png",
          purpose: "any"
        },
        {
          src: imageLinkGenerate(website.favicon),
          sizes: "96x96",
          type: "image/png",
          purpose: "any"
        },
        {
          src: imageLinkGenerate(website.favicon),
          sizes: "128x128",
          type: "image/png",
          purpose: "any"
        },
        {
          src: imageLinkGenerate(website.favicon),
          sizes: "144x144",
          type: "image/png",
          purpose: "any"
        },
        {
          src: imageLinkGenerate(website.favicon),
          sizes: "152x152",
          type: "image/png",
          purpose: "any"
        },
        {
          src: imageLinkGenerate(website.favicon),
          sizes: "192x192",
          type: "image/png",
          purpose: "any maskable"
        },
        {
          src: imageLinkGenerate(website.favicon),
          sizes: "384x384",
          type: "image/png",
          purpose: "any"
        },
        {
          src: imageLinkGenerate(website.favicon),
          sizes: "512x512",
          type: "image/png",
          purpose: "any maskable"
        }
      ],
      categories: ["games", "entertainment"],
      lang: "tr",
      dir: "ltr",
      prefer_related_applications: false,
      related_applications: [],
      shortcuts: [
        {
          name: "Ana Sayfa",
          short_name: "Ana",
          description: "Ana sayfaya git",
          url: "/home",
          icons: [
            {
              src: imageLinkGenerate(website.favicon),
              sizes: "96x96"
            }
          ]
        },
        {
          name: "Mağaza",
          short_name: "Mağaza",
          description: "Mağazayı aç",
          url: "/store",
          icons: [
            {
              src: imageLinkGenerate(website.favicon),
              sizes: "96x96"
            }
          ]
        }
      ]
    };

    return NextResponse.json(manifest, {
      headers: {
        "Content-Type": "application/manifest+json",
        "Cache-Control": "public, max-age=3600, s-maxage=3600"
      }
    });
  } catch (error) {
    console.error("Manifest oluşturulurken hata:", error);
    
    // Fallback manifest
    const fallbackManifest = {
      name: "Crafter Void",
      short_name: "Crafter",
      description: "Minecraft projeleri için modern web platformu",
      start_url: "/home",
      display: "standalone",
      background_color: "#ffffff",
      theme_color: "#000000",
      orientation: "portrait-primary",
      icons: [
        {
          src: "/crafter.png",
          sizes: "192x192",
          type: "image/png",
          purpose: "any maskable"
        },
        {
          src: "/crafter.png",
          sizes: "512x512",
          type: "image/png",
          purpose: "any maskable"
        }
      ],
      categories: ["games", "entertainment"],
      lang: "tr",
      dir: "ltr"
    };

    return NextResponse.json(fallbackManifest, {
      headers: {
        "Content-Type": "application/manifest+json",
        "Cache-Control": "public, max-age=3600, s-maxage=3600"
      }
    });
  }
}
