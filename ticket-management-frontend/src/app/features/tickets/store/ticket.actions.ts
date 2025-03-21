import {createAction, props} from "@ngrx/store";
import {Page} from "../../../shared/models/page.model";
import {TicketResponse} from "../../../shared/models/ticket-response.model";
import {TicketCreateRequest} from "../../../shared/models/ticket-create-request.model";
import {TicketUpdateRequest} from "../../../shared/models/ticket-update-request.model";

export interface TicketFilters {
  status?: string;
  search?: string;
}

export interface LoadMyTicketsPayload {
  userId: string;
  pageable: {
    page: number;
    size: number;
    sort?: string;
  };
  filters?: TicketFilters;
}
export const loadTickets = createAction(
  '[Ticket] Load Tickets',
  props<{ pageable: { page: number; size: number; sort?: string } }>()
);

export const loadTicketsSuccess = createAction(
  '[Ticket] Load Tickets Success',
  props<{ page: Page<TicketResponse> }>()
);

export const loadTicketsFailure = createAction(
  '[Ticket] Load Tickets Failure',
  props<{ error: string }>()
);

// Load My Tickets
export const loadMyTickets = createAction(
  '[Tickets] Load My Tickets',
  props<LoadMyTicketsPayload>()
);

export const loadMyTicketsSuccess = createAction(
  '[Ticket] Load My Tickets Success',
  props<{ page: Page<TicketResponse> }>()
);

export const loadMyTicketsFailure = createAction(
  '[Ticket] Load My Tickets Failure',
  props<{ error: string }>()
);


// Load Assigned Tickets
export const loadAssignedTickets = createAction(
  '[Ticket] Load Assigned Tickets',
  props<{ userId: number; pageable: { page: number; size: number; sort?: string } }>()
);

export const loadAssignedTicketsSuccess = createAction(
  '[Ticket] Load Assigned Tickets Success',
  props<{ page: Page<TicketResponse> }>()
);

export const loadAssignedTicketsFailure = createAction(
  '[Ticket] Load Assigned Tickets Failure',
  props<{ error: string }>()
);

// Create Ticket
export const createTicket = createAction(
  '[Ticket] Create Ticket',
  props<{ request: TicketCreateRequest }>()
);

export const createTicketSuccess = createAction(
  '[Ticket] Create Ticket Success',
  props<{ ticket: TicketResponse }>()
);

export const createTicketFailure = createAction(
  '[Ticket] Create Ticket Failure',
  props<{ error: string }>()
);

// Update Ticket
export const updateTicket = createAction(
  '[Ticket] Update Ticket',
  props<{ id: number; request: TicketUpdateRequest }>()
);

export const updateTicketSuccess = createAction(
  '[Ticket] Update Ticket Success',
  props<{ ticket: TicketResponse }>()
);

export const updateTicketFailure = createAction(
  '[Ticket] Update Ticket Failure',
  props<{ error: string }>()
);

export const searchTicketsByClient = createAction(
  '[Ticket] Search Tickets By Client',
  props<{ searchQuery?: string; status?: string; page: number; size: number }>()
);

export const searchTicketsByClientSuccess = createAction(
  '[Ticket] Search Tickets By Client Success',
  props<{ tickets: Page<TicketResponse> }>() // Changed from TicketResponse[] to Page<TicketResponse>
);

export const searchTicketsByClientFailure = createAction(
  '[Ticket] Search Tickets Failure',
  props<{ error: string }>()
);

// Update Ticket Status
export const updateTicketStatus = createAction(
  '[Ticket] Update Ticket Status',
  props<{ ticketId: number; status: string }>()
);

export const updateTicketStatusSuccess = createAction(
  '[Ticket] Update Ticket Status Success',
  props<{ ticket: TicketResponse }>()
);

export const updateTicketStatusFailure = createAction(
  '[Ticket] Update Ticket Status Failure',
  props<{ error: string }>()
);

// Delete Ticket
export const deleteTicket = createAction(
  '[Ticket] Delete Ticket',
  props<{ ticketId: number }>()
);

export const deleteTicketSuccess = createAction(
  '[Ticket] Delete Ticket Success',
  props<{ ticketId: number }>()
);

export const deleteTicketFailure = createAction(
  '[Ticket] Delete Ticket Failure',
  props<{ error: string }>()
);
