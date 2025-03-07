import { createReducer, on } from '@ngrx/store';
import { AgentState, initialAgentState} from "./agent.state";
import * as AgentActions from './agent.action';
import {deleteCommentSuccess} from "./agent.action";

export const agentReducer = createReducer(
  initialAgentState,

  // Load Tickets
  on(AgentActions.loadAssignedTickets, (state) => ({
    ...state,
    loading: true,
    error: null,
  })),
  on(AgentActions.loadAssignedTicketsSuccess, (state, { tickets }) => ({
    ...state,
    tickets,
    loading: false,
  })),
  on(AgentActions.loadAssignedTicketsFailure, (state, { error }) => ({
    ...state,
    error,
    loading: false,
  })),

  // Load Ticket By ID
  on(AgentActions.loadTicketById, (state) => ({
    ...state,
    loading: true,
    error: null,
  })),
  on(AgentActions.loadTicketByIdSuccess, (state, { ticket }) => {
    // Check if the ticket already exists in the state
    const ticketExists = state.tickets.some(t => t.id === ticket.id);

    return {
      ...state,
      tickets: ticketExists
        ? state.tickets.map(t => t.id === ticket.id ? ticket : t)
        : [...state.tickets, ticket],
      loading: false,
    };
  }),
  on(AgentActions.loadTicketByIdFailure, (state, { error }) => ({
    ...state,
    error,
    loading: false,
  })),

  // Search Tickets
  on(AgentActions.searchTickets, (state) => ({
    ...state,
    loading: true,
    error: null,
  })),
  on(AgentActions.searchTicketsSuccess, (state, { tickets }) => ({
    ...state,
    tickets,
    loading: false,
  })),
  on(AgentActions.searchTicketsFailure, (state, { error }) => ({
    ...state,
    error,
    loading: false,
  })),

  // Update Ticket Status
  on(AgentActions.updateTicketStatus, (state) => ({
    ...state,
    loading: true,
    error: null,
  })),
  on(AgentActions.updateTicketStatusSuccess, (state, { ticket }) => ({
    ...state,
    tickets: state.tickets.map((t) => (t.id === ticket.id ? ticket : t)),
    loading: false,
  })),
  on(AgentActions.updateTicketStatusFailure, (state, { error }) => ({
    ...state,
    error,
    loading: false,
  })),

  // Add Comment
  on(AgentActions.addComment, (state) => ({
    ...state,
    loading: true,
    error: null,
  })),
  on(deleteCommentSuccess, (state, { ticketId, commentId }) => ({
    ...state,
    tickets: state.tickets.map((ticket) =>
      ticket.id === ticketId
        ? {
          ...ticket,
          comments: ticket.comments!.filter((comment) => comment.id !== commentId),
        }
        : ticket
    ),
  })),
  on(AgentActions.addCommentSuccess, (state, { ticket }) => ({
    ...state,
    tickets: state.tickets.map((t) => (t.id === ticket.id ? ticket : t)),
    loading: false,
  })),
  on(AgentActions.addCommentFailure, (state, { error }) => ({
    ...state,
    error,
    loading: false,
  }))
);
