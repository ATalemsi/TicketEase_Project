import {createAction, props} from "@ngrx/store";
import {TicketResponse} from "../../../shared/models/ticket-response.model";

export const loadAssignedTickets = createAction(
  '[Agent] Load Assigned Tickets'
);

export const loadAssignedTicketsSuccess = createAction(
  '[Agent] Load Assigned Tickets Success',
  props<{ tickets: TicketResponse[] }>()
);

export const loadAssignedTicketsFailure = createAction(
  '[Agent] Load Assigned Tickets Failure',
  props<{ error: string }>()
);

// Load Ticket By ID
export const loadTicketById = createAction(
  '[Agent] Load Ticket By ID',
  props<{ ticketId: number }>()
);

export const loadTicketByIdSuccess = createAction(
  '[Agent] Load Ticket By ID Success',
  props<{ ticket: TicketResponse }>()
);

export const loadTicketByIdFailure = createAction(
  '[Agent] Load Ticket By ID Failure',
  props<{ error: string }>()
);

// Update Ticket Status
export const updateTicketStatus = createAction(
  '[Agent] Update Ticket Status',
  props<{ ticketId: number; status: string }>()
);

export const updateTicketStatusSuccess = createAction(
  '[Agent] Update Ticket Status Success',
  props<{ ticket: TicketResponse }>()
);

export const updateTicketStatusFailure = createAction(
  '[Agent] Update Ticket Status Failure',
  props<{ error: string }>()
);

// Add Comment
export const addComment = createAction(
  '[Agent] Add Comment',
  props<{ ticketId: number; comment: string }>()
);

export const addCommentSuccess = createAction(
  '[Agent] Add Comment Success',
  props<{ ticket: TicketResponse }>()
);

export const addCommentFailure = createAction(
  '[Agent] Add Comment Failure',
  props<{ error: string }>()
);
export const deleteComment = createAction(
  '[Agent] Delete Comment',
  props<{ ticketId: number; commentId: number }>()
);

export const deleteCommentSuccess = createAction(
  '[Agent] Delete Comment Success',
  props<{ ticketId: number; commentId: number }>()
);

export const deleteCommentFailure = createAction(
  '[Agent] Delete Comment Failure',
  props<{ error: string }>()
);
// Search Tickets
export const searchTickets = createAction(
  '[Agent] Search Tickets',
  props<{ status: string; priority: string; searchQuery: string; page: number; size: number }>()
);

export const searchTicketsSuccess = createAction(
  '[Agent] Search Tickets Success',
  props<{ tickets: TicketResponse[] }>()
);

export const searchTicketsFailure = createAction(
  '[Agent] Search Tickets Failure',
  props<{ error: string }>()
);
