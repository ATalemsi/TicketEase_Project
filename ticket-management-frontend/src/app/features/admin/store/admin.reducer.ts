import { createReducer, on } from '@ngrx/store';
import { AdminActions } from './admin.actions';
import { Page } from "../../../shared/models/page.model";
import { TicketResponse, User } from "../../../shared/models/ticket-response.model";

export interface AdminState {
  tickets: Page<TicketResponse> | null;
  agentTickets: Page<TicketResponse> | null;
  assignedTickets: Page<TicketResponse> | null;
  unassignedTickets: Page<TicketResponse> | null;
  users: User[] | null;
  agents: User[] | null;
  performanceMetrics: any | null;
  loading: boolean;
  error: string | null;
}

export const initialState: AdminState = {
  tickets: null,
  agentTickets: null,
  assignedTickets: null,
  unassignedTickets: null,
  users: null,
  agents: null,
  performanceMetrics: null,
  loading: false,
  error: null,
};

export const adminReducer = createReducer(
  initialState,

  // Load all tickets
  on(AdminActions.loadTickets, (state) => ({
    ...state,
    loading: true,
    error: null,
  })),
  on(AdminActions.loadTicketsSuccess, (state, { tickets }) => ({
    ...state,
    tickets: { ...tickets, data: Array.isArray(tickets.content) ? tickets.content : [tickets.content] },
    loading: false,
  })),
  on(AdminActions.loadTicketsFailure, (state, { error }) => ({
    ...state,
    error,
    loading: false,
  })),

  // Load unassigned tickets
  on(AdminActions.loadUnassignedTickets, (state) => ({
    ...state,
    loading: true,
    error: null
  })),
  on(AdminActions.loadUnassignedTicketsSuccess,  (state, { unassignedTickets }) => ({
    ...state,
    unassignedTickets: { ...unassignedTickets, data: Array.isArray(unassignedTickets.content) ? unassignedTickets.content : [unassignedTickets.content] },
    loading: false,
  })),
  on(AdminActions.loadUnassignedTicketsFailure, (state, { error }) => ({
    ...state,
    error,
    loading: false
  })),

  // Load agent tickets
  on(AdminActions.loadAgentTickets, (state) => ({
    ...state,
    loading: true,
    error: null,
  })),
  on(AdminActions.loadAgentTicketsSuccess, (state, { tickets }) => ({
    ...state,
    agentTickets: tickets,
    loading: false,
  })),
  on(AdminActions.loadAgentTicketsFailure, (state, { error }) => ({
    ...state,
    error,
    loading: false,
  })),

  // Load assigned tickets
  on(AdminActions.loadAssignedTickets, (state) => ({
    ...state,
    loading: true,
    error: null,
  })),
  on(AdminActions.loadAssignedTicketsSuccess, (state, { tickets }) => ({
    ...state,
    assignedTickets: tickets,
    loading: false,
  })),
  on(AdminActions.loadAssignedTicketsFailure, (state, { error }) => ({
    ...state,
    error,
    loading: false,
  })),

  // Load users
  on(AdminActions.loadUsers, (state) => ({
    ...state,
    loading: true,
    error: null,
  })),
  on(AdminActions.loadUsersSuccess, (state, { users }) => ({
    ...state,
    users,
    loading: false,
  })),
  on(AdminActions.loadUsersFailure, (state, { error }) => ({
    ...state,
    error,
    loading: false,
  })),

  // Load agents
  on(AdminActions.loadAgents, (state) => ({
    ...state,
    loading: true,
    error: null
  })),
  on(AdminActions.loadAgentsSuccess, (state, { agents }) => ({
    ...state,
    agents,
    loading: false
  })),
  on(AdminActions.loadAgentsFailure, (state, { error }) => ({
    ...state,
    error,
    loading: false
  })),



  // Update user status
  on(AdminActions.updateUserStatus, (state) => ({
    ...state,
    loading: true,
    error: null
  })),
  on(AdminActions.updateUserStatusSuccess, (state, { user }) => ({
    ...state,
    users: state.users ? state.users.map(u => u.id === user.id ? user : u) : null,
    loading: false
  })),
  on(AdminActions.updateUserStatusFailure, (state, { error }) => ({
    ...state,
    error,
    loading: false
  })),

  // Load performance metrics
  on(AdminActions.loadPerformanceMetrics, (state) => ({
    ...state,
    loading: true,
    error: null
  })),
  on(AdminActions.loadPerformanceMetricsSuccess, (state, { metrics }) => ({
    ...state,
    performanceMetrics: metrics,
    loading: false
  })),
  on(AdminActions.loadPerformanceMetricsFailure, (state, { error }) => ({
    ...state,
    error,
    loading: false
  })),

  // Reset state
  on(AdminActions.resetState, () => initialState)
);
