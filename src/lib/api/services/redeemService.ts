import { useApi } from "../useApi";

export interface RedeemCodeResponse {
  success: boolean;
  message: string;
  bonus?: number;
  products?: { id: string; name: string }[];
}

export class RedeemService {
  private api: ReturnType<typeof useApi>;

  constructor() {
    this.api = useApi(); // v1 default
  }

  redeemCode = async (code: string): Promise<RedeemCodeResponse> => {
    const response = await this.api.post<RedeemCodeResponse>(
      `/redeem-codes/use`,
      { code },
      {},
      true
    );
    return response.data;
  };
}

// Client-side instance
export const redeemService = () => new RedeemService();

// For server-side usage
export const serverRedeemService = () => new RedeemService();
