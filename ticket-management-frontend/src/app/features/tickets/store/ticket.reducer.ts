import { initialTicketState } from './ticket.state';
import { createReducer, on } from '@ngrx/store';
import {
  createTicket,
  createTicketFailure,
  createTicketSuccess, deleteTicket, deleteTicketFailure, deleteTicketSuccess,
  loadAssignedTickets,
  loadAssignedTicketsFailure,
  loadAssignedTicketsSuccess,
  loadMyTickets,
  loadMyTicketsFailure,
  loadMyTicketsSuccess,
  loadTickets,
  loadTicketsFailure,
  loadTicketsSuccess, searchTicketsByClient, searchTicketsByClientFailure, searchTicketsByClientSuccess,
  updateTicket,
  updateTicketFailure, updateTicketStatus, updateTicketStatusFailure, updateTicketStatusSuccess,
  updateTicketSuccess,
} from './ticket.actions';

export const ticketReducer = createReducer(
  initialTicketState,

  // Load Tickets
  on(loadTickets, (state) => ({ ...state, loading: true, error: null })),
  on(loadTicketsSuccess, (state, { page }) => ({
    ...state,
    tickets: page,
    loading: false,
  })),
  on(loadTicketsFailure, (state, { error }) => ({
    ...state,
    error,
    loading: false,
  })),

  // Load My Tickets
  on(loadMyTickets, (state) => ({ ...state, loading: true, error: null })),
  on(loadMyTicketsSuccess, (state, { page }) => ({
    ...state,
    myTickets: page,
    loading: false,
  })),
  on(loadMyTicketsFailure, (state, { error }) => ({
    ...state,
    error,
    loading: false,
  })),

  // Load Assigned Tickets
  on(loadAssignedTickets, (state) => ({ ...state, loading: true, error: null })),
  on(loadAssignedTicketsSuccess, (state, { page }) => ({
    ...state,
    assignedTickets: page,
    loading: false,
  })),
  on(loadAssignedTicketsFailure, (state, { error }) => ({
    ...state,
    error,
    loading: false,
  })),

  // Create Ticket
  on(createTicket, (state) => ({ ...state, loading: true, error: null })),
  on(createTicketSuccess, (state, { ticket }) => {
    if (!state.tickets) return state;

    return {
      ...state,
      tickets: {
        ...state.tickets,
        content: [ticket, ...(state.tickets?.content || [])],
        last: state.tickets?.last ?? false,
        totalElements: (state.tickets?.totalElements || 0) + 1, // Update total elements
      },
      loading: false,
    };
  }),
  on(createTicketFailure, (state, { error }) => ({
    ...state,
    error,
    loading: false,
  })),

  // Search Tickets
  on(searchTicketsByClient, (state) => ({
    ...state,
    loading: true,
    error: null,
  })),
  on(searchTicketsByClientSuccess, (state, { tickets }) => ({
    ...state,
    myTickets: tickets, // Change from tickets to myTickets
    loading: false,
  })),
  on(searchTicketsByClientFailure, (state, { error }) => ({
    ...state,
    error,
    loading: false,
  })),

  // Update Ticket
  on(updateTicket, (state) => ({ ...state, loading: true, error: null })),
  on(updateTicketSuccess, (state, { ticket }) => ({
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
  on(updateTicketFailure, (state, { error }) => ({
    ...state,
    error,
    loading: false,
  })),
  // Update Ticket Status
  on(updateTicketStatus, (state) => ({
    ...state,
    loading: true,
    error: null,
  })),
  on(updateTicketStatusSuccess, (state, { ticket }) => {
    if (!state.tickets) {
      // If tickets is null, return state unchanged or handle as needed
      return {
        ...state,
        loading: false,
      };
    }

    // Map over the content array to update the specific ticket
    const updatedContent = state.tickets.content.map((t) =>
      t.id === ticket.id ? ticket : t
    );

    // Return a new Page<TicketResponse> object with updated content
    return {
      ...state,
      tickets: {
        ...state.tickets,           // Spread existing Page properties (totalPages, etc.)
        content: updatedContent     // Replace content with updated array
      },
      loading: false,
    };
  }),
  on(updateTicketStatusFailure, (state, { error }) => ({
    ...state,
    error,
    loading: false,
  })),


  // Delete Ticket
  on(deleteTicket, (state) => ({ ...state, loading: true, error: null })),
  on(deleteTicketSuccess, (state, { ticketId }) => {
    if (!state.tickets) return state;

    // Remove the deleted ticket from tickets state
    return {
      ...state,
      tickets: {
        ...state.tickets,
        content: state.tickets.content.filter(ticket => ticket.id !== ticketId),
        totalElements: state.tickets.totalElements! - 1
      },
      // Also remove from myTickets if present
      myTickets: state.myTickets ? {
        ...state.myTickets,
        content: state.myTickets.content.filter(ticket => ticket.id !== ticketId),
        totalElements: state.myTickets.totalElements! - 1
      } : state.myTickets,
      loading: false
    };
  }),
  on(deleteTicketFailure, (state, { error }) => ({
    ...state,
    error,
    loading: false
  })),
);
