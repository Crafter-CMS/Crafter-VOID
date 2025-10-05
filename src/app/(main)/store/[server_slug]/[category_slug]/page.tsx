import ProductCard from "@/components/ui/store/product-card";
import { serverCategoriesService } from "@/lib/api/services/categoriesService";
import { serverProductsService } from "@/lib/api/services/productsService";
import { serverWebsiteService } from "@/lib/api/services/websiteService";
import { Metadata } from "next";
import { DefaultBreadcrumb } from "@/components/ui/breadcrumb";
import { serverServersService } from "@/lib/api/services/serversService";
import Title from "@/components/ui/title";
import { serverMarketplaceService } from "@/lib/api/services/marketplaceService";
import StaticAlert from "@/components/ui/alerts/static-alert";
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
  params: Promise<{ server_slug: string; category_slug: string }>;
}): Promise<Metadata> {
  const headersList = await headers();
  const websiteId = headersList.get("x-website-id") as string;
  const category = await serverCategoriesService(websiteId).getCategory(
    (
      await params
    ).category_slug
  );
  return {
    title: `${category.name}`,
    description: `${category.name} isimli kategoriye ait ürünler!`,
  };
}

export default async function CategoryPage({
  params,
}: {
  params: Promise<{ server_slug: string; category_slug: string }>;
}) {
  const website = await getWebsite();

  const headersList = await headers();
  const websiteId = headersList.get("x-website-id") as string;
  const category = await serverCategoriesService(websiteId).getCategory(
    (await params).category_slug
  );
  const server = await serverServersService(websiteId).getServer(category.server_id);

  const products = await serverProductsService(websiteId).getProductsByCategory(category.id);

  const marketplaceSettings = await serverMarketplaceService(websiteId).getMarketplaceSettings();

  return (
    <div>
      <div className="flex flex-col gap-4">
        <DefaultBreadcrumb
          items={[
            { label: "Mağaza", href: "/store" },
            { label: server.name, href: `/store/${server.slug}` },
            {
              label: category.name,
              href: `/store/${server.slug}/${category.slug}`,
            },
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
          title={category.name}
          description={`${category.name} isimli kategoriye ait ürünler!`}
        />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {products.length > 0 ? (
            products.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                currency={website.currency}
                bulkDiscount={marketplaceSettings.bulkDiscount}
              />
            ))
          ) : (
            <p className="text-muted-foreground">
              Bu kategoriye ait ürün bulunamadı.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
