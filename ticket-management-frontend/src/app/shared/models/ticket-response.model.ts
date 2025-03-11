export interface TicketResponse {
  id: number;
  title: string;
  description: string;
  status: string;
  priority: string;
  createdAt: string;
  updatedAt: string;
  creator: {
    id: number,
    email: string,
    fullName: string
  },
  assignedAgent: {
    id: number,
    email: string,
    fullName: string
  },
  comments?: {
    id: number;
    content: string;
    author: {
      id: number;
      email: string;
      fullName: string;
    };
    creationDate: string; // ISO string from backend
  }[];
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
  fullName: string;
  role: string;
  active: boolean;
}
