import { useApi } from "../useApi";
import { SendGiftRequest, SendGiftResponse } from "@/lib/types/gift";
import { ChestItem } from "@/lib/types/chest";

// Gift service following the same pattern as ChestService
export class GiftService {
  private api: ReturnType<typeof useApi>;
  private chestApi: ReturnType<typeof useApi>;

  constructor() {
    this.api = useApi({ version: "v2" }); // Using v2 like the backend controller
    this.chestApi = useApi(); // Using v1 for chest endpoints
  }

  /**
   * Send balance as a gift to another user
   * Uses the balance transfer endpoint
   * @param userId - Sender user ID or "me"
   * @param giftData - Gift data including targetUserId and amount
   */
  async sendBalanceGift(
    userId: string,
    giftData: SendGiftRequest
  ): Promise<SendGiftResponse> {
    const response = await this.api.post<SendGiftResponse>(
      `/users/${userId}/balance/send`,
      {
        targetUserId: giftData.targetUserId,
        amount: giftData.amount,
      },
      {},
      true
    );

    return response.data;
  }

  /**
   * Send a chest item as a gift to another user
   * @param websiteId - Website ID
   * @param userId - Sender user ID or "me"
   * @param toUserId - Receiver user ID
   * @param chestItemId - Chest item ID to gift
   */
  async sendChestItemGift(
    websiteId: string,
    userId: string,
    toUserId: string,
    chestItemId: string
  ): Promise<{ success: boolean; message: string; chestItem?: ChestItem }> {
    const response = await this.chestApi.post<{
      success: boolean;
      message: string;
      chestItem?: ChestItem;
    }>(
      `/chest/${userId}/gift/${toUserId}/${chestItemId}`,
      {},
      {},
      true
    );

    return response.data;
  }
}

// Client-side instance
export const giftService = () => new GiftService();

// For server-side usage
export const serverGiftService = () => new GiftService();
