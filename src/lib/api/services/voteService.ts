import { ApiClient } from "../useApi";

export interface VoteProvider {
  id: string;
  type: 'serversmc' | 'minecraftlist' | 'topg' | 'minecraftservers';
  name: string;
  description: string;
  image: string;
  isActive: boolean;
  cooldownHours: number;
}

export interface VoteRequest {
  providerId?: string;
}

export interface VoteResponse {
  success: boolean;
  message: string;
  canVoteAt?: string;
}

export interface VoteProvidersResponse {
  success: boolean;
  providers: VoteProvider[];
}


// Server-side vote service using ApiClient
export class VoteService {
  private api: ApiClient;

  constructor(apiClient?: ApiClient) {
    this.api =
      apiClient ||
      new ApiClient(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/website/${process.env.NEXT_PUBLIC_WEBSITE_ID}`
      );
  }

  async getVoteProviders(): Promise<VoteProvidersResponse> {
    try {
      const response = await this.api.get<VoteProvidersResponse>(
        "/config/vote-providers"
      );
      return response.data;
    } catch (error) {
      console.error("Error getting vote providers:", error);
      throw error;
    }
  }

  async sendVote(data: VoteRequest): Promise<VoteResponse> {
    try {
      const response = await this.api.post<VoteResponse>(
        "/config/vote-providers/vote",
        data,
        {},
        true
      );
      return response.data;
    } catch (error) {
      console.error("Error sending vote:", error);
      throw error;
    }
  }

}

// Create a default instance for server-side usage
export const voteService = new VoteService();

// For backward compatibility, export the function-based approach
export const serverVoteService = () => {
  const service = new VoteService();

  return {
    getVoteProviders: service.getVoteProviders.bind(service),
    sendVote: service.sendVote.bind(service),
  };
};
