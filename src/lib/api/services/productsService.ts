import { Product } from "@/lib/types/product";
import { useApi, useServerApi } from "../useApi";

export class ProductsService {
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

  async getProductsByCategory(category_id: string): Promise<Product[]> {
    const response = await this.api.get<Product[]>(
      `/products/by-category/${category_id}`,
      {},
      true
    );
    return response.data;
  };

  async getProductById(product_id: string): Promise<Product> {
    const response = await this.api.get<Product>(`/products/${product_id}`, {}, true);
    return response.data;
  }
}

// Client-side instance
export const productsService = () => new ProductsService();

// For server-side usage - now accepts websiteId
export const serverProductsService = (websiteId: string) => new ProductsService(websiteId);
