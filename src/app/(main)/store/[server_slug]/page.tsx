import { Metadata } from "next";
import { serverServersService } from "@/lib/api/services/serversService";
import StoreCard from "@/components/ui/store/store-card";
import { serverCategoriesService } from "@/lib/api/services/categoriesService";
import { DefaultBreadcrumb } from "@/components/ui/breadcrumb";
import Title from "@/components/ui/title";
import StaticAlert from "@/components/ui/alerts/static-alert";
import { serverMarketplaceService } from "@/lib/api/services/marketplaceService";
import { serverWebsiteService } from "@/lib/api/services/websiteService";
import { headers } from "next/headers";

async function getWebsite() {
  const headersList = await headers();
  const websiteId = headersList.get("x-website-id") as string;

  const websiteService = serverWebsiteService(websiteId as string);
  const website = await websiteService.getWebsite({ id: websiteId || "" });
  
  return website;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ server_slug: string }>;
}): Promise<Metadata> {
  const headersList = await headers();
  const websiteId = headersList.get("x-website-id") as string;
  const server = await serverServersService(websiteId).getServer((await params).server_slug);
  return {
    title: `${server.name}`,
    description: `${server.name} isimli oyuna ait ürün kategorileri!`,
  };
}

export default async function ServerPage({
  params,
}: {
  params: Promise<{ server_slug: string }>;
}) {
  const website = await getWebsite();
  const headersList = await headers();
  const websiteId = headersList.get("x-website-id") as string;
  const server = await serverServersService(websiteId).getServer((await params).server_slug);
  const categories = await serverCategoriesService(websiteId).getCategoriesByServer(
    server.id
  );
  const marketplaceSettings = await serverMarketplaceService(websiteId).getMarketplaceSettings();
  return (
    <div>
      <div className="flex flex-col gap-4">
        <DefaultBreadcrumb
          items={[
            { label: "Mağaza", href: "/store" },
            { label: server.name, href: `/store/${server.slug}` },
          ]}
        />
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
            message={
              "Tüm ürünlerde geçerli indirimleri kullanmak için ürünlere göz atın."
            }
          />
        ) : null}
        <Title
          title={server.name}
          description={`${server.name} isimli oyuna ait ürün kategorileri!`}
        />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {categories.length > 0 ? (
            categories.map((category) => (
              <StoreCard
                key={category.id}
                name={category.name}
                image={category.image}
                slug={category.slug}
                redirectUrl={`/store/${server.slug}/${category.slug}`}
              />
            ))
          ) : (
            <p className="text-muted-foreground">
              Bu oyuna ait kategori bulunamadı.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
