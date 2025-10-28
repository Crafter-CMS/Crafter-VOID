import { Metadata } from "next";
import { serverServersService } from "@/lib/api/services/serversService";
import StoreCard from "@/components/ui/store/store-card";
import { DefaultBreadcrumb } from "@/components/ui/breadcrumb";
import Title from "@/components/ui/title";
import { serverMarketplaceService } from "@/lib/api/services/marketplaceService";
import StaticAlert from "@/components/ui/alerts/static-alert";
import { serverWebsiteService } from "@/lib/api/services/websiteService";
import { headers } from "next/headers";
import { Server } from "@/lib/types/server";

async function getWebsite() {
  const headersList = await headers();
  const websiteId = headersList.get("x-website-id") as string;

  const websiteService = serverWebsiteService(websiteId as string);
  const website = await websiteService.getWebsite({
    id: websiteId || "",
  });
  
  return website;
}

export const metadata: Metadata = {
  title: "Mağaza",
  description: "Mağaza'da birbirinden farklı ürünlere göz atın.",
};

export default async function StorePage() {
  const headersList = await headers();
  const websiteId = headersList.get("x-website-id") as string;
  const servers = await serverServersService(websiteId).getServers();
  const marketplaceSettings = await serverMarketplaceService(websiteId).getMarketplaceSettings();
  const website = await getWebsite();

  return (
    <div>
      <div className="flex flex-col gap-4">
        <DefaultBreadcrumb items={[{ label: "Mağaza", href: "/store" }]} />
        {marketplaceSettings.bulkDiscount ? (
          <StaticAlert
            type="info"
            title={`Tüm ürünlerde geçerli ${
              marketplaceSettings.bulkDiscount.amount
            } ${
              marketplaceSettings.bulkDiscount.type === "fixed"
                ? website.currency
                : "%"
            } indirim!`}
            message={"Tüm ürünlerde geçerli indirimleri kullanmak için ürünlere göz atın."}
          />
        ) : null}
        <Title
          title="Oyunlar"
          description="Mağaza'da birbirinden farklı ürünlere göz atın."
        />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {servers.length > 0 ? (
            servers.map((server: Server) => (
              <StoreCard
                key={server.id}
                name={server.name}
                image={server.image}
                slug={server.slug}
                redirectUrl={`/store/${server.slug}`}
              />
            ))
          ) : (
            <p className="text-muted-foreground">Oyun bulunamadı.</p>
          )}
        </div>
      </div>
    </div>
  );
}
