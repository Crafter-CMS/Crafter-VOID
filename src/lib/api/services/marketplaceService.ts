import { useApi, useServerApi } from "../useApi";
import type { Coupon, MarketplaceSettings } from "@/lib/types/marketplace";

// Server-side website service using ApiClient
export class MarketplaceService {
  private api: ReturnType<typeof useApi>;

  constructor(websiteId?: string) {
    if (websiteId) {
      // Server-side usage with websiteId
      this.api = useServerApi(websiteId); // v1 default
    } else {
      // Client-side usage
      this.api = useApi(); // v1 default
    }
  }

  async purchaseProduct(
    productIds: string[],
    coupon?: string
  ): Promise<{ success: string; message: string; type: string }> {
    const response = await this.api.post<{
      success: string;
      message: string;
      type: string;
    }>(`/marketplace/purchase`, { productIds, coupon }, {}, true);
    return response.data;
  }

  async getCouponInfo(couponCode: string): Promise<Coupon> {
    const response = await this.api.get<Coupon>(`/coupons/${couponCode}`, {}, true);
    return response.data;
  }

  async getMarketplaceSettings(): Promise<MarketplaceSettings> {
    const response = await this.api.get<MarketplaceSettings>(`/config/marketplace`, {}, true);
    return response.data;
  }
}

// Client-side instance
export const marketplaceService = () => new MarketplaceService();

// For server-side usage - now accepts websiteId
export const serverMarketplaceService = (websiteId: string) => new MarketplaceService(websiteId);
