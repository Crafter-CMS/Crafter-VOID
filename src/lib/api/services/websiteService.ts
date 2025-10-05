import { useApi, useServerApi } from "../useApi";
import { Website } from "../../types/website";
import { License } from "../../types/license";

export interface GetWebsiteRequest {
  id?: string;
  url?: string;
}

export interface VerifyLicenseKeyRequest {
  key: string;
}

export interface VerifyLicenseKeyResponse {
  success: boolean;
  message: string;
  website: Website;
  license: License;
}

export interface GetWebsiteStatisticsResponse {
  latest: {
    purchases: {
      id: string;
      username: string;
      productName: string;
      serverName: string;
      amount: number;
      timestamp: string;
    }[];
    payments: {
      id: string;
      username: string;
      amount: number;
      paymentMethod: string;
      timestamp: string;
    }[];
    signups: {
      id: string;
      username: string;
    }[];
  };
}

export class WebsiteService {
  private api: ReturnType<typeof useApi>;
  private statisticsApi: ReturnType<typeof useApi>;

  constructor(websiteId?: string) {
    if (websiteId) {
      this.api = useServerApi(websiteId);
      this.statisticsApi = useServerApi(websiteId, { version: "v2" });
    } else {
      this.api = useApi();
      this.statisticsApi = useApi({ version: "v2" });
    }
  }

  async verifyLicenseKey(data: VerifyLicenseKeyRequest): Promise<VerifyLicenseKeyResponse> {
    try {
      const response = await this.api.post<VerifyLicenseKeyResponse>("/website/key/verify", data);
      return response.data;
    } catch (error) {
      console.error("Error verifying license key:", error);
      throw error;
    }
  }

  async getWebsite(data: GetWebsiteRequest): Promise<Website> {
    try {
      const response = await this.api.get<Website>("");
      return response.data;
    } catch (error) {
      console.error("Error getting website:", error);
      throw error;
    }
  }

  async getWebsiteStatistics(): Promise<GetWebsiteStatisticsResponse> {
    try {
      const response = await this.statisticsApi.get<GetWebsiteStatisticsResponse>("/statistics");
      return response.data;
    } catch (error) {
      console.error("Error getting website statistics:", error);
      throw error;
    }
  }
}

export const websiteService = () => new WebsiteService();
export const serverWebsiteService = (websiteId: string) => new WebsiteService(websiteId);
