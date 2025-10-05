import { useApi } from "../useApi";
import { Report, ReportType } from "@/lib/types/website";

export class ReportService {
  private api: ReturnType<typeof useApi>;

  constructor() {
    this.api = useApi(); // v1 default
  }

  async reportUser(
    userId: string,
    reportReason: string,
    type: ReportType
  ): Promise<Report> {
    const response = await this.api.post<Report>(`/reports/${userId}`, {
      reason: reportReason,
      reportType: type,
    });
    return response.data;
  }
}

// Client-side instance
export const reportService = () => new ReportService();

// For server-side usage
export const serverReportService = () => new ReportService();
