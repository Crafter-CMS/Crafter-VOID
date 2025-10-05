import {apiClient, useApi, useServerApi} from "../useApi";
import {
  GetHelpDto,
  HelpCategory,
  HelpData,
  HelpFAQ,
  HelpItem,
} from "@/lib/types/help";

// Server-side website service using ApiClient
export class HelpService {
  private api: ReturnType<typeof useApi>;

  constructor(websiteId?: string) {
    if (websiteId) {
      this.api = useServerApi(websiteId);
    } else {
      this.api = useApi();
    }
  }

  // Help Center data operations
  getHelpCenter = async (data: {
    query?: GetHelpDto;
  }): Promise<HelpData> => {
    const response = await this.api.get<HelpData>(
      `/helpcenter`,
      { params: data.query || {} },
      true
    );
    return response.data;
  };

  // Category operations
  getCategory = async (data: {
    categoryId: string;
  }): Promise<HelpCategory> => {
    const response = await this.api.get<HelpCategory>(
      `/helpcenter/category/${data.categoryId}`,
      {},
      true
    );
    return response.data;
  };

  // Item operations
  getItem = async (data: {
    itemId: string;
  }): Promise<HelpItem> => {
    const response = await this.api.get<HelpItem>(
      `/helpcenter/item/${data.itemId}`,
      {},
      true
    );
    return response.data;
  };

  // FAQ operations
  getFAQ = async (data: {
    faqId: string;
  }): Promise<HelpFAQ> => {
    const response = await this.api.get<HelpFAQ>(
      `/helpcenter/faq/${data.faqId}`,
      {},
      true
    );
    return response.data;
  };
}

// Client-side instance
export const helpService = () => new HelpService();

// For server-side usage
export const serverHelpService = (websiteId: string) => new HelpService(websiteId);
