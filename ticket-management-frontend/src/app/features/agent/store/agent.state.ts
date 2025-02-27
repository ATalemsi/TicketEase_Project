import {TicketResponse} from "../../../shared/models/ticket-response.model";

export interface AgentState {
  tickets: TicketResponse[];
  loading: boolean;
  error: string | null;
}

export const initialAgentState: AgentState = {
  tickets: [],
  loading: false,
  error: null,
};
