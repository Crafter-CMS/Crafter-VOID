import {Category} from '@/lib/types/category';
import {useApi, useServerApi} from '../useApi';

export class CategoriesService {
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
    async getCategories(): Promise<Category[]> {
        try {
            const response = await this.api.get<Category[]>('/categories', {}, true);
            return response.data;
        } catch (error) {
            console.error('Error getting categories:', error);
            throw error;
        }
    }

    async getCategoriesByServer(server_id: string): Promise<Category[]> {
        const response = await this.api.get<Category[]>('/categories', {}, true);
        const filteredCategories = response.data.filter(category => category.server_id === server_id);
        return filteredCategories;
    }

    // Tek bir sunucuyu getir
    async getCategory(categoryId: string): Promise<Category> {
        try {
            const response = await this.api.get<Category>(`/categories/${categoryId}`, {}, true);
            return response.data;
        } catch (error) {
            console.error('Error getting category:', error);
            throw error;
        }
    }
}

// Client-side instance
export const categoriesService = () => new CategoriesService();

// For server-side usage - now accepts websiteId
export const serverCategoriesService = (websiteId: string) => new CategoriesService(websiteId);
