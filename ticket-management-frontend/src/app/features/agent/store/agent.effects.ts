import {Injectable} from '@angular/core';
import {Actions, createEffect, ofType} from '@ngrx/effects';
import {of} from 'rxjs';
import {catchError, map, mergeMap} from 'rxjs/operators';
import {AgentServiceService as AgentService} from "../../../core/service/agent-service/agent-service.service";
import * as AgentActions from './agent.action';

@Injectable()
export class AgentEffects {
  constructor(private readonly actions$: Actions, private agentService: AgentService) {
  }

  // Load Tickets
  loadAssignedTickets$ = createEffect(() =>
    this.actions$.pipe(
      ofType(AgentActions.loadAssignedTickets),
      mergeMap(() =>
        this.agentService.getAssignedTickets(0, 10).pipe(
          map((tickets) => AgentActions.loadAssignedTicketsSuccess({tickets: tickets.content})),
          catchError((error) => of(AgentActions.loadAssignedTicketsFailure({error: error.message})))
        )
      )
    )
  );

  // Update Ticket Status
  updateTicketStatus$ = createEffect(() =>
    this.actions$.pipe(
      ofType(AgentActions.updateTicketStatus),
      mergeMap(({ticketId, status}) =>
        this.agentService.updateTicketStatus(ticketId, status).pipe(
          map((ticket) => AgentActions.updateTicketStatusSuccess({ticket})),
          catchError((error) => of(AgentActions.updateTicketStatusFailure({error: error.message})))
        )
      )
    )
  );

  // Load Ticket By ID
  loadTicketById$ = createEffect(() =>
    this.actions$.pipe(
      ofType(AgentActions.loadTicketById),
      mergeMap(({ticketId}) =>
        this.agentService.getTicketById(ticketId).pipe(
          map((ticket) => AgentActions.loadTicketByIdSuccess({ticket})),
          catchError((error) => of(AgentActions.loadTicketByIdFailure({error: error.message})))
        )
      )
    )
  );

  // Search Tickets
  searchTickets$ = createEffect(() =>
    this.actions$.pipe(
      ofType(AgentActions.searchTickets),
      mergeMap(({status, priority, searchQuery, page, size}) =>
        this.agentService.searchTickets(status, priority, searchQuery, page, size).pipe(
          map((response) => AgentActions.searchTicketsSuccess({tickets: response.content})),
          catchError((error) => of(AgentActions.searchTicketsFailure({error: error.message})))
        )
      )
    )
  );

  // Add Comment
  addComment$ = createEffect(() =>
    this.actions$.pipe(
      ofType(AgentActions.addComment),
      mergeMap(({ticketId, comment}) =>
        this.agentService.addComment(ticketId, comment).pipe(
          map((ticket) => AgentActions.addCommentSuccess({ticket})),
          catchError((error) => of(AgentActions.addCommentFailure({error: error.message})))
        )
      )
    )
  );
}
