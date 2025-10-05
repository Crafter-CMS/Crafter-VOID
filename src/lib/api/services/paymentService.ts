import { useApi, useServerApi } from "../useApi";
import { ChestItem } from "@/lib/types/chest";
import {
  CheckPaymentData,
  InitiatePaymentData,
  InitiatePaymentResponse,
} from "@/lib/types/payment";
import { PaymentProvider } from "@/lib/types/payment";

// Server-side website service using ApiClient
export class PaymentService {
  private api: ReturnType<typeof useApi>;
  private configApi: ReturnType<typeof useApi>;

  constructor(websiteId?: string) {
    if (websiteId) {
      // Server-side usage with websiteId
      this.configApi = useServerApi(websiteId); // v1 for config endpoints
      this.api = useServerApi(websiteId, { version: "v1" }); // For payment endpoints with direct API access
    } else {
      // Client-side usage
      this.configApi = useApi(); // v1 for config endpoints (uses websiteId in path)
      // For payment endpoints - use skipWebsiteId to get direct backend URL
      this.api = useApi({ version: "v1", skipWebsiteId: true }); // Direct API without websiteId in path
    }
  }

  async getPaymentProviders(): Promise<PaymentProvider[]> {
    const response = await this.configApi.get<PaymentProvider[]>(
      `/config/payment/public`,
      {},
      true
    );
    return response.data;
  }

  async initiatePayment(
    data: InitiatePaymentData
  ): Promise<InitiatePaymentResponse> {
    // Use direct API call to /payment/initiate (websiteId is in data body)
    const response = await this.api.post<InitiatePaymentResponse>(
      `/website/payment/initiate`,
      data,
      {},
      true
    );
    return response.data;
  }

  async checkPayment(
    data: CheckPaymentData
  ): Promise<{ success: boolean; status: "COMPLETED" | "FAILED" | "PENDING" }> {
    // Use direct API call to /payment/check (websiteId is in data body)
    const response = await this.api.post<{
      success: boolean;
      status: "COMPLETED" | "FAILED" | "PENDING";
    }>(`/website/payment/check`, data, {}, true);
    return response.data;
  }
}

// Client-side instance
export const paymentService = () => new PaymentService();

// For server-side usage
export const serverPaymentService = (websiteId: string) => new PaymentService(websiteId);
