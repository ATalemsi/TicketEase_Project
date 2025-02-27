import { Injectable } from "@angular/core";
import {Actions, createEffect, ofType} from "@ngrx/effects";
import {TicketService} from "../../../core/service/ticket/ticket.service";
import {
  createTicket,
  createTicketFailure,
  createTicketSuccess,
  loadAssignedTickets,
  loadAssignedTicketsFailure,
  loadAssignedTicketsSuccess,
  loadMyTickets,
  loadMyTicketsFailure,
  loadMyTicketsSuccess,
  loadTickets,
  loadTicketsFailure,
  loadTicketsSuccess,
  searchTicketsByClient, searchTicketsByClientFailure,
  searchTicketsByClientSuccess,
  updateTicket,
  updateTicketFailure, updateTicketStatus, updateTicketStatusFailure, updateTicketStatusSuccess,
  updateTicketSuccess
} from "./ticket.actions";
import {catchError, mergeMap, of, switchMap, tap} from "rxjs";
import {map} from "rxjs/operators";
import {Router} from "@angular/router";
import {TicketResponse} from "../../../shared/models/ticket-response.model";
import {Page} from "../../../shared/models/page.model";

@Injectable()
export class TicketEffects {
  constructor(
    private readonly actions$: Actions,
    private readonly ticketService: TicketService,
    private readonly router: Router
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

  searchTicketsByClient$ = createEffect(() =>
    this.actions$.pipe(
      ofType(searchTicketsByClient),
      tap(action => console.log('Effect triggered with action:', action)),
      switchMap(({ searchQuery, status, page, size }) =>
        this.ticketService.searchTicketsByClient(searchQuery, status, page, size).pipe(
          tap(tickets => console.log('Service returned:', tickets)),
          map((tickets: Page<TicketResponse>) => searchTicketsByClientSuccess({ tickets })),
          catchError((error) => {
            console.error('Search error:', error);
            return of(searchTicketsByClientFailure({ error: error.message }));
          })
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

  // Update Ticket Status
  updateTicketStatus$ = createEffect(() =>
    this.actions$.pipe(
      ofType(updateTicketStatus),
      mergeMap(({ticketId, status}) =>
        this.ticketService.updateTicketStatus(ticketId, status).pipe(
          map((ticket) => updateTicketStatusSuccess({ticket})),
          catchError((error) => of(updateTicketStatusFailure({error: error.message})))
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

  // Navigation effect after successful ticket creation
  createTicketSuccess$ = createEffect(() =>
      this.actions$.pipe(
        ofType(createTicketSuccess),
        tap(() => this.router.navigate(['/client/dashboard']))
      ),
    { dispatch: false }
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
