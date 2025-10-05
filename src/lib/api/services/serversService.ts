import { Server } from "@/lib/types/server";
import { useApi, useServerApi } from "../useApi";

export class ServersService {
  private api: ReturnType<typeof useApi>;

  constructor(websiteId?: string) {
    if (websiteId) {
      // Server-side usage with websiteId
      this.api = useServerApi(websiteId); // v1 default
    } else {
      // Client-side usage
      this.api = useApi(); // v1 default
    }
  }

  // Tüm sunucuları getir
  async getServers(): Promise<Server[]> {
    try {
      const response = await this.api.get<Server[]>(
        `/config/servers`,
        {},
        true
      );
      return response.data;
    } catch (error) {
      console.error("Error getting servers:", error);
      throw error;
    }
  }

  // Tek bir sunucuyu getir
  async getServer(serverId: string): Promise<Server> {
    try {
      const response = await this.api.get<Server>(
        `/config/servers/${serverId}`,
        {},
        true
      );
      return response.data;
    } catch (error) {
      console.error("Error getting server:", error);
      throw error;
    }
  }
}

// Client-side instance
export const serversService = () => new ServersService();

// For server-side usage - now accepts websiteId
export const serverServersService = (websiteId: string) => new ServersService(websiteId);
