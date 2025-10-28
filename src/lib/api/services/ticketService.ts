import { useApi } from "../useApi";
import {
  CreateTicketDto,
  ReplyTicketDto,
  Ticket,
  TicketCategory,
} from "@/lib/types/ticket";

export interface TicketResponse {
  success: boolean;
  message: string;
}

export class TicketService {
  private api: ReturnType<typeof useApi>;

  constructor() {
    this.api = useApi({ version: "v2" }); // v1 default
  }

  getTickets = async (): Promise<Ticket[]> => {
    const response = await this.api.get<Ticket[]>(`/tickets`, {}, true);
    return response.data;
  };

  getTicket = async (data: { ticketId: string }): Promise<Ticket> => {
    const response = await this.api.get<Ticket>(
      `/tickets/${data.ticketId}`,
      {},
      true
    );
    return response.data;
  };

  createTicket = async (data: { ticket: CreateTicketDto }): Promise<Ticket> => {
    const response = await this.api.post<Ticket>(
      `/tickets`,
      data.ticket,
      {},
      true
    );
    return response.data;
  };

  replyToTicket = async (data: {
    ticketId: string;
    reply: ReplyTicketDto;
  }): Promise<Ticket> => {
    const response = await this.api.post<Ticket>(
      `/tickets/${data.ticketId}/reply`,
      data.reply,
      {},
      true
    );
    return response.data;
  };

  getTicketCategories = async (): Promise<TicketCategory[]> => {
    const response = await this.api.get<TicketCategory[]>(
      `/tickets/categories`,
      {},
      true
    );
    return response.data;
  };

  getTicketCategory = async (data: {
    categoryId: string;
  }): Promise<TicketCategory> => {
    const response = await this.api.get<TicketCategory>(
      `/tickets/categories/${data.categoryId}`,
      {},
      true
    );
    return response.data;
  };
}

// Client-side instance
export const ticketService = () => new TicketService();

// For server-side usage
export const serverTicketService = () => new TicketService();
