import { createFeatureSelector, createSelector } from '@ngrx/store';
import { AdminState } from './admin.reducer';

export const selectAdminState = createFeatureSelector<AdminState>('admin');

export const selectAllTickets = createSelector(
  selectAdminState,
  (state) => state.tickets
);

export const selectAgentTickets = createSelector(
  selectAdminState,
  (state) => state.agentTickets
);

export const selectAssignedTickets = createSelector(
  selectAdminState,
  (state) => state.assignedTickets
);

export const selectUnassignedTickets = createSelector(
  selectAdminState,
  (state) => state.unassignedTickets
);

export const selectUsers = createSelector(
  selectAdminState,
  (state) => state.users
);

export const selectAgents = createSelector(
  selectAdminState,
  (state) => state.agents
);

export const selectPerformanceMetrics = createSelector(
  selectAdminState,
  (state) => state.performanceMetrics
);

export const selectLoading = createSelector(
  selectAdminState,
  (state) => state.loading
);

export const selectError = createSelector(
  selectAdminState,
  (state) => state.error
);
