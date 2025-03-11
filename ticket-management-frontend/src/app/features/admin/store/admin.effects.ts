import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import {mergeMap, of} from 'rxjs';
import { map, catchError, switchMap } from 'rxjs/operators';
import { AdminServiceService as AdminService} from "../../../core/service/admin-service/admin-service.service";
import { AdminActions } from './admin.actions';

@Injectable()
export class AdminEffects {
  loadTickets$ = createEffect(() =>
    this.actions$.pipe(
      ofType(AdminActions.loadTickets),
      switchMap(({ page, size }) =>
        this.adminService.getAllTickets(page, size).pipe(
          map(tickets => AdminActions.loadTicketsSuccess({ tickets })),
          catchError(error => of(AdminActions.loadTicketsFailure({ error: error.message })))
        )
      )
    )
  );

  loadAgentTickets$ = createEffect(() =>
    this.actions$.pipe(
      ofType(AdminActions.loadAgentTickets),
      switchMap(({ agentId, page, size }) =>
        this.adminService.getTicketsByAgent(agentId, page, size).pipe(
          map(tickets => AdminActions.loadAgentTicketsSuccess({ tickets })),
          catchError(error => of(AdminActions.loadAgentTicketsFailure({ error: error.message })))
        )
      )
    )
  );

  loadAssignedTickets$ = createEffect(() =>
    this.actions$.pipe(
      ofType(AdminActions.loadAssignedTickets),
      switchMap(({ page, size }) =>
        this.adminService.getAssignedTickets(page, size).pipe(
          map(tickets => AdminActions.loadAssignedTicketsSuccess({ tickets })),
          catchError(error => of(AdminActions.loadAssignedTicketsFailure({ error: error.message })))
        )
      )
    )
  );

  assignTicket$ = createEffect(() =>
    this.actions$.pipe(
      ofType(AdminActions.assignTicket),
      switchMap(({ ticketId, agentId }) =>
        this.adminService.assignTicketToAgent(ticketId, agentId).pipe(
          map(ticket => AdminActions.assignTicketSuccess({ ticket })),
          catchError(error => of(AdminActions.assignTicketFailure({ error: error.message })))
        )
      )
    )
  );

  loadUsers$ = createEffect(() =>
    this.actions$.pipe(
      ofType(AdminActions.loadUsers),
      switchMap(() =>
        this.adminService.getAllUsers().pipe(
          map(users => AdminActions.loadUsersSuccess({ users })),
          catchError(error => of(AdminActions.loadUsersFailure({ error: error.message })))
        )
      )
    )
  );

  loadAgents$ = createEffect(() =>
    this.actions$.pipe(
      ofType(AdminActions.loadAgents),
      switchMap(() =>
        this.adminService.getAgents().pipe(
          map(agents => AdminActions.loadAgentsSuccess({ agents })),
          catchError(error => of(AdminActions.loadAgentsFailure({
            error: error.message || 'Failed to load agents'
          })))
        )
      )
    )
  );

  // Ticket assignment
  // In admin.effects.ts
  loadUnassignedTickets$ = createEffect(() =>
    this.actions$.pipe(
      ofType(AdminActions.loadUnassignedTickets),
      switchMap(() =>
        this.adminService.getUnassignedTickets().pipe(
          map(tickets => {
            // Transform the response to match the Page interface
            const pageResponse = {
              content: tickets, // The API already returns an array of tickets
              totalElements: tickets.length,
              totalPages: 1,
              size: tickets.length,
              number: 0,
              last: true
            };
            return AdminActions.loadUnassignedTicketsSuccess({ tickets: pageResponse });
          }),
          catchError(error => of(AdminActions.loadUnassignedTicketsFailure({
            error: error.message || 'Failed to load unassigned tickets'
          })))
        )
      )
    )
  );


  updateUserStatus$ = createEffect(() =>
    this.actions$.pipe(
      ofType(AdminActions.updateUserStatus),
      mergeMap(({ userId, active }) =>
        this.adminService.updateUserStatus(userId, active).pipe(
          map(user => AdminActions.updateUserStatusSuccess({ user })),
          catchError(error => of(AdminActions.updateUserStatusFailure({
            error: error.message || 'Failed to update user status'
          })))
        )
      )
    )
  );

  // Performance metrics
  loadPerformanceMetrics$ = createEffect(() =>
    this.actions$.pipe(
      ofType(AdminActions.loadPerformanceMetrics),
      switchMap(() =>
        this.adminService.getPerformanceMetrics().pipe(
          map(metrics => AdminActions.loadPerformanceMetricsSuccess({ metrics })),
          catchError(error => of(AdminActions.loadPerformanceMetricsFailure({
            error: error.message || 'Failed to load performance metrics'
          })))
        )
      )
    )
  );

  constructor(
    private readonly actions$: Actions,
    private readonly adminService: AdminService
  ) {}
}
