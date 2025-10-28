import {useApi, useServerApi} from "../useApi";

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
export class VoteService {
    private api: ReturnType<typeof useApi>;

    constructor(websiteId?: string) {
        if (websiteId) {
            this.api = useServerApi(websiteId);
        } else {
            this.api = useApi();
        }
    }

    async getVoteProviders(): Promise<any> {
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

// Client-side instance
export const voteService = () => new VoteService();

// For server-side usage
export const serverVoteService = (websiteId: string) => new VoteService(websiteId);
