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
  responses?: TicketResponseDetail[];
}

export interface TicketResponseDetail {
  id: number;
  agentName: string;
  message: string;
  date: Date;
}

export interface Comment {
  id: number;
  content: string;
  author: User;
  createdAt: string;
}

export interface User {
  id: number;
  email: string;
}
