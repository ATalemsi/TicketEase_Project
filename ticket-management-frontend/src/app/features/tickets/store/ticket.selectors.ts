import {createFeatureSelector, createSelector} from "@ngrx/store";
import {TicketState} from "./ticket.state";

export const selectTicketState = createFeatureSelector<TicketState>('tickets');

export const selectTickets = createSelector(
  selectTicketState,
  (state) => state.tickets
);

export const selectMyTickets = createSelector(
  selectTicketState,
  (state) => state.myTickets
);

export const selectAssignedTickets = createSelector(
  selectTicketState,
  (state) => state.assignedTickets
);

export const selectLoading = createSelector(
  selectTicketState,
  (state) => state.loading
);

export const selectError = createSelector(
  selectTicketState,
  (state) => state.error
);
