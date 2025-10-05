import {useApi, useServerApi} from "../useApi";

/**
 * @description Punishment veri yapısını tanımlar (AdvancedBan/LiteBans uyumlu).
 */
export interface Punishment {
    id: string;
    name: string;
    uuid: string;
    reason: string;
    operator: string;
    punishmentType: "BAN" | "MUTE" | "KICK" | "WARNING" | "TEMP_BAN" | "TEMP_MUTE" | "TEMP_WARNING" | "IP_BAN" | "NOTE";
    start: string; // ISO timestamp
    end: string; // ISO timestamp or '-1' for permanent
    calculation: string; // Duration calculation
}

/**
 * @description Punishments konfigürasyon veri yapısını tanımlar.
 */
export interface PunishmentsConfig {
    type: 'advancedban' | 'litebans';
    isActive: boolean;
    database: {
        host: string;
        port: number;
        username: string;
        password: string;
        database: string;
    };
}

/**
 * @description Punishments arama parametreleri.
 */
export interface SearchPunishmentsParams {
    query: string;
    type?: string;
    page?: number;
    limit?: number;
}

/**
 * @description Punishments getirme parametreleri.
 */
export interface GetPunishmentsParams {
    type?: string;
    page?: number;
    limit?: number;
}

/**
 * @description Pagination bilgilerini içeren yanıt yapısı.
 */
export interface PaginatedResponse<T> {
    data: T[];
    pagination: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
        hasNext: boolean;
        hasPrev: boolean;
    };
}

/**
 * @description Punishments API yanıt yapısı (gerçek API formatı).
 */
export interface PunishmentsApiResponse {
    punishments: Punishment[];
    pagination: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
        hasNext: boolean;
        hasPrev: boolean;
    };
}

/**
 * @description Punishments konfigürasyon yanıtı.
 */
export interface PunishmentsConfigResponse {
    punishments: PunishmentsConfig | null;
}

/**
 * @description Punishments konfigürasyon güncelleme yanıtı.
 */
export interface UpdatePunishmentsConfigResponse {
    punishments: PunishmentsConfig;
    message: string;
}

/**
 * @description Punishments konfigürasyon silme yanıtı.
 */
export interface DeletePunishmentsConfigResponse {
    message: string;
}

// Server-side punishment service using ApiClient
export class PunishmentService {
    private api: ReturnType<typeof useApi>;

    constructor(websiteId?: string) {
        if (websiteId) {
            this.api = useServerApi(websiteId);
        } else {
            this.api = useApi();
        }
    }

    /**
     * @description Punishments'ları arar.
     */
    async searchPunishments(
        websiteId: string,
        params: SearchPunishmentsParams
    ): Promise<PunishmentsApiResponse> {
        try {
            const queryParams = new URLSearchParams();

            queryParams.append('query', params.query);
            if (params.type) queryParams.append('type', params.type);
            if (params.page) queryParams.append('page', params.page.toString());
            if (params.limit) queryParams.append('limit', params.limit.toString());

            const response = await this.api.get<PunishmentsApiResponse>(
                `/config/punishments/search?${queryParams.toString()}`,
                {},
                true
            );
            return response.data;
        } catch (error) {
            console.error("Error searching punishments:", error);
            throw error;
        }
    }

    /**
     * @description Punishments'ları getirir.
     */
    async getPunishments(
        websiteId: string,
        params?: GetPunishmentsParams
    ): Promise<PunishmentsApiResponse> {
        try {
            const queryParams = new URLSearchParams();

            if (params?.type) queryParams.append('type', params.type);
            if (params?.page) queryParams.append('page', params.page.toString());
            if (params?.limit) queryParams.append('limit', params.limit.toString());

            const queryString = queryParams.toString();
            const url = `/config/punishments${queryString ? `?${queryString}` : ''}`;

            const response = await this.api.get<PunishmentsApiResponse>(
                url,
                {},
                true
            );
            return response.data;
        } catch (error) {
            console.error("Error getting punishments:", error);
            throw error;
        }
    }

    /**
     * @description Belirli bir tipteki punishments'ları getirir.
     */
    async getPunishmentsByType(
        websiteId: string,
        type: string,
        page?: number,
        limit?: number
    ): Promise<PunishmentsApiResponse> {
        return this.getPunishments(websiteId, {
            type,
            page,
            limit,
        });
    }

    /**
     * @description Aktif punishments'ları getirir.
     */
    async getActivePunishments(
        websiteId: string,
        page?: number,
        limit?: number
    ): Promise<PunishmentsApiResponse> {
        return this.getPunishments(websiteId, {
            page,
            limit,
        });
    }

    /**
     * @description Belirli bir oyuncunun punishments'larını arar.
     */
    async searchPlayerPunishments(
        websiteId: string,
        playerName: string,
        type?: string,
        page?: number,
        limit?: number
    ): Promise<PunishmentsApiResponse> {
        return this.searchPunishments(websiteId, {
            query: playerName,
            type,
            page,
            limit,
        });
    }
}

// Client-side instance
export const punishmentService = () => new PunishmentService();

// For server-side usage
export const serverPunishmentService = (websiteId: string) => new PunishmentService(websiteId);
