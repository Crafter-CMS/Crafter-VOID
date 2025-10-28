import {useApi, useServerApi} from "@/lib/api/useApi";

/**
 * @description Legal dokümanların veri yapısı.
 */
export interface LegalDocuments {
    rules: Record<string, any> | null;
    privacy_policy: Record<string, any> | null;
    terms_of_service: Record<string, any> | null;
}

export class LegalService {
    private api: ReturnType<typeof useApi>;

    constructor(websiteId?: string) {
        if (websiteId) {
            this.api = useServerApi(websiteId);
        } else {
            this.api = useApi();
        }
    }

    async getLegalDocuments(): Promise<LegalDocuments> {
        const response = await this.api.get<LegalDocuments>(`/config/legal`, {}, true);
        return response.data;
    }

}

// Client-side instance
export const legalService = () => new LegalService();

// For server-side usage
export const serverLegalService = (websiteId: string) => new LegalService(websiteId);
