export interface TicketResponse {
  id: number;
  title: string;
  description: string;
  status: string;
  priority: string;
  createdAt: string;
  updatedAt: string;
  creatorId: number;
  agentId?: number;
}
