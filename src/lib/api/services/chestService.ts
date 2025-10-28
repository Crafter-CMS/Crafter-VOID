import { useApi } from "../useApi";
import { ChestItem } from "@/lib/types/chest";

// Server-side website service using ApiClient
export class ChestService {
  private api: ReturnType<typeof useApi>;

  constructor() {
    this.api = useApi(); // v1 default
  }

  async getChestItems(user_id: string): Promise<ChestItem[]> {
    const response = await this.api.get<ChestItem[]>(`/chest/${user_id}`, {}, true);
    return response.data;
  }

  async useChestItem(
    user_id: string,
    product_id: string
  ): Promise<{ success: boolean; message: string; type: string }> {
    const response = await this.api.post<{
      success: boolean;
      message: string;
      type: string;
    }>(`/chest/${user_id}/use/${product_id}`, {}, {}, true);

    return response.data;
  }
}

// Client-side instance
export const chestService = () => new ChestService();

// For server-side usage
export const serverChestService = () => new ChestService();
