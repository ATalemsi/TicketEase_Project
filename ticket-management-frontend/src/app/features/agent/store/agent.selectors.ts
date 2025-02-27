import { createSelector, createFeatureSelector } from '@ngrx/store';
import { AgentState } from './agent.state';

export const selectAgentState = createFeatureSelector<AgentState>('agent');

export const selectTickets = createSelector(
  selectAgentState,
  (state) => state.tickets
);

export const selectLoading = createSelector(
  selectAgentState,
  (state) => state.loading
);

export const selectError = createSelector(
  selectAgentState,
  (state) => state.error
);
