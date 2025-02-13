import {initialTicketState} from "./ticket.state";
import {createReducer, on} from "@ngrx/store";
import {
  createTicket, createTicketFailure, createTicketSuccess,
  loadAssignedTickets, loadAssignedTicketsFailure, loadAssignedTicketsSuccess,
  loadMyTickets, loadMyTicketsFailure,
  loadMyTicketsSuccess,
  loadTickets,
  loadTicketsFailure,
  loadTicketsSuccess, updateTicket, updateTicketFailure, updateTicketSuccess
} from "./ticket.actions";

export const ticketReducer = createReducer(
  initialTicketState,

  // Load Tickets
  on(loadTickets, (state) => ({...state, loading: true, error: null})),
  on(loadTicketsSuccess, (state, {page}) => ({
    ...state,
    tickets: page,
    loading: false,
  })),
  on(loadTicketsFailure, (state, {error}) => ({
    ...state,
    error,
    loading: false,
  })),

  // Load My Tickets
  on(loadMyTickets, (state) => ({...state, loading: true, error: null})),
  on(loadMyTicketsSuccess, (state, {page}) => ({
    ...state,
    myTickets: page,
    loading: false,
  })),
  on(loadMyTicketsFailure, (state, {error}) => ({
    ...state,
    error,
    loading: false,
  })),

  // Load Assigned Tickets
  on(loadAssignedTickets, (state) => ({...state, loading: true, error: null})),
  on(loadAssignedTicketsSuccess, (state, {page}) => ({
    ...state,
    assignedTickets: page,
    loading: false,
  })),
  on(loadAssignedTicketsFailure, (state, {error}) => ({
    ...state,
    error,
    loading: false,
  })),

  // Create Ticket
  on(createTicket, (state) => ({...state, loading: true, error: null})),
  on(createTicketSuccess, (state, {ticket}) => ({
    ...state,
    tickets: {
      ...state.tickets,
      content: [ticket, ...(state.tickets?.content || [])],
      last: state.tickets?.last ?? false,
    },
    loading: false,
  })),
  on(createTicketFailure, (state, {error}) => ({
    ...state,
    error,
    loading: false,
  })),

  // Update Ticket
  on(updateTicket, (state) => ({...state, loading: true, error: null})),
  on(updateTicketSuccess, (state, {ticket}) => ({
    ...state,
    tickets: {
      ...state.tickets,
      content: state.tickets?.content.map((t) =>
        t.id === ticket.id ? ticket : t
      ) || [],
      last: state.tickets?.last ?? false,
    },
    loading: false,
  })),
  on(updateTicketFailure, (state, {error}) => ({
    ...state,
    error,
    loading: false,
  }))
);
