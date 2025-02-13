import { TicketResponse } from "../../../shared/models/ticket-response.model";
import {Page} from "../../../shared/models/page.model";

export interface TicketState {
  tickets: Page<TicketResponse> | null;
  myTickets: Page<TicketResponse> | null;
  assignedTickets: Page<TicketResponse> | null;
  loading: boolean;
  error: string | null;
}

export const initialTicketState: TicketState = {
  tickets: null,
  myTickets: null,
  assignedTickets: null,
  loading: false,
  error: null,
};
