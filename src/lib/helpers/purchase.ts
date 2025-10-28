import type { Product } from "@/lib/types/product";
import { serverMarketplaceService } from "@/lib/api/services/marketplaceService";

export default async function Purchase({ product, websiteId }: { product: Product, websiteId: string }) {
  const marketplaceService = serverMarketplaceService(websiteId);
  const settings = await marketplaceService.getMarketplaceSettings();
  console.log(settings);
}
