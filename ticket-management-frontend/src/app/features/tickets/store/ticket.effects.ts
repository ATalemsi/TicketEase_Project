import { Injectable } from "@angular/core";
import {Actions, createEffect, ofType} from "@ngrx/effects";
import {TicketService} from "../../../core/service/ticket/ticket.service";
import {
  createTicket, createTicketFailure, createTicketSuccess,
  loadAssignedTickets, loadAssignedTicketsFailure, loadAssignedTicketsSuccess,
  loadMyTickets, loadMyTicketsFailure,
  loadMyTicketsSuccess,
  loadTickets,
  loadTicketsFailure,
  loadTicketsSuccess, updateTicket, updateTicketFailure, updateTicketSuccess
} from "./ticket.actions";
import {catchError, mergeMap, of} from "rxjs";
import {map} from "rxjs/operators";

@Injectable()
export class TicketEffects {
  constructor(
    private readonly actions$: Actions,
    private readonly ticketService: TicketService
  ) {}

  // Load Tickets
  loadTickets$ = createEffect(() =>
    this.actions$.pipe(
      ofType(loadTickets),
      mergeMap(({ pageable }) =>
        this.ticketService.getAllTickets(pageable).pipe(
          map((page) => loadTicketsSuccess({ page })),
          catchError((error) => of(loadTicketsFailure({ error: error.message })))
        )
      )
    )
  );

  // Load My Tickets
  loadMyTickets$ = createEffect(() =>
    this.actions$.pipe(
      ofType(loadMyTickets),
      mergeMap(({ userId, pageable }) =>
        this.ticketService.getMyTickets(userId, pageable).pipe(
          map((page) => loadMyTicketsSuccess({ page })),
          catchError((error) => of(loadMyTicketsFailure({ error: error.message })))
        )
      )
    )
  );

  // Load Assigned Tickets
  loadAssignedTickets$ = createEffect(() =>
    this.actions$.pipe(
      ofType(loadAssignedTickets),
      mergeMap(({ userId, pageable }) =>
        this.ticketService.getAssignedTickets(userId, pageable).pipe(
          map((page) => loadAssignedTicketsSuccess({ page })),
          catchError((error) => of(loadAssignedTicketsFailure({ error: error.message })))
        )
      )
    )
  );

  // Create Ticket
  createTicket$ = createEffect(() =>
    this.actions$.pipe(
      ofType(createTicket),
      mergeMap(({ request }) =>
        this.ticketService.createTicket(request).pipe(
          map((ticket) => createTicketSuccess({ ticket })),
          catchError((error) => of(createTicketFailure({ error: error.message })))
        )
      )
    )
  );

  // Update Ticket
  updateTicket$ = createEffect(() =>
    this.actions$.pipe(
      ofType(updateTicket),
      mergeMap(({ id, request }) =>
        this.ticketService.updateTicket(id, request).pipe(
          map((ticket) => updateTicketSuccess({ ticket })),
          catchError((error) => of(updateTicketFailure({ error: error.message })))
        )
      )
    )
  );
}
