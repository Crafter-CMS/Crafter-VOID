import { StaffForm, StaffFormApplication, StaffFormApplicationValue } from '@/lib/types/staff-form';
import { useApi, useServerApi } from '../useApi';

export class StaffFormService {
  private api: ReturnType<typeof useApi>;

  constructor(websiteId?: string) {
    if (websiteId) {
      this.api = useServerApi(websiteId);
    } else {
      this.api = useApi();
    }
  }

  // Tüm formları getir
  async getForms(): Promise<StaffForm[]> {
    const response = await this.api.get<StaffForm[]>('/staff-forms', {}, true);
    return response.data;
  }

  // Tek bir formu id veya slug ile getir
  async getForm(idOrSlug: string): Promise<StaffForm> {
    const response = await this.api.get<StaffForm>(`/staff-forms/${idOrSlug}`, {}, true);
    return response.data;
  }

  // Formu başvuru olarak yanıtla (tüm inputlar tek seferde)
  async submitFormApplication(
    formId: string,
    values: StaffFormApplicationValue[]
  ): Promise<StaffFormApplication> {
    const response = await this.api.post<StaffFormApplication>(
      `/staff-forms/${formId}/apply`,
      { values },
      {},
      true
    );
    return response.data;
  }

  // Kullanıcının kendi başvurularını getir
  async getMyApplications(): Promise<StaffFormApplication[]> {
    const response = await this.api.get<StaffFormApplication[]>(
      '/staff-forms/applications',
      {},
      true
    );
    return response.data;
  }
}

// Client-side instance
export const staffFormService = () => new StaffFormService();

// For server-side usage
export const serverStaffFormService = (websiteId: string) => new StaffFormService(websiteId);
