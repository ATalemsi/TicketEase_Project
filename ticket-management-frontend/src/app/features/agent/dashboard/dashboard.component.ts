import {Component, OnDestroy, OnInit} from '@angular/core';
import {TicketResponse} from "../../../shared/models/ticket-response.model";
import {Observable, map, Subject, takeUntil} from "rxjs";
import {Store} from "@ngrx/store";
import {addComment, loadAssignedTickets, updateTicketStatus} from "../store/agent.action";
import {selectError, selectLoading, selectTickets} from "../store/agent.selectors";
import {AsyncPipe, DatePipe, NgClass, NgForOf, NgIf, TitleCasePipe} from "@angular/common";
import {SidebarComponent} from "../../../shared/components/sidebar/sidebar.component";
import {AuthState} from "../../auth/store/auth.reducer";
import {selectUserId} from "../../auth/store/auth.selectors";
import {WebsocketService} from "../../../core/service/websocket/websocket.service";
import {RouterLink} from "@angular/router";

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    NgIf,
    AsyncPipe,
    NgForOf,
    DatePipe,
    NgClass,
    SidebarComponent,
    TitleCasePipe,
    RouterLink
  ],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css'
})
export class DashboardComponent implements OnInit , OnDestroy {
  tickets$: Observable<TicketResponse[]>;
  loading$: Observable<boolean>;
  error$: Observable<string | null>;
  userRole$: Observable<string | null>;
  userId$: Observable<string | null>; // Add userId observable
  showNotifications = false;
  private readonly destroy$ = new Subject<void>();

  notificationMessage: string | null = null;

  // Derived observables for ticket counts
  openTicketsCount$: Observable<number>;
  inProgressTicketsCount$: Observable<number>;
  resolvedTicketsCount$: Observable<number>;
  closedTicketsCount$: Observable<number>;

  constructor(private readonly store: Store<{ auth: AuthState }> , private readonly websocketService: WebsocketService) {
    this.tickets$ = this.store.select(selectTickets);
    this.loading$ = this.store.select(selectLoading);
    this.error$ = this.store.select(selectError);
    this.userRole$ = this.store.select((state) => state.auth.role);
    this.userId$ = this.store.select(selectUserId); // Use the selector


    // Create derived observables for ticket counts
    this.openTicketsCount$ = this.tickets$.pipe(
      map(tickets => tickets ? tickets.filter(t => t.status === 'OPEN').length : 0)
    );

    this.inProgressTicketsCount$ = this.tickets$.pipe(
      map(tickets => tickets ? tickets.filter(t => t.status === 'IN_PROGRESS').length : 0)
    );

    this.resolvedTicketsCount$ = this.tickets$.pipe(
      map(tickets => tickets ? tickets.filter(t => t.status === 'RESOLVED').length : 0)
    );
    this.closedTicketsCount$ = this.tickets$.pipe(
      map(tickets => tickets ? tickets.filter(t => t.status === 'CLOSED').length : 0)
    );
  }

  ngOnInit(): void {
    this.store.dispatch(loadAssignedTickets());


  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  getFilteredTickets(tickets: TicketResponse[], status: string): TicketResponse[] {
    return tickets.filter(ticket => ticket.status === status);
  }

  updateStatus(ticketId: number, status: string): void {
    this.store.dispatch(updateTicketStatus({ ticketId, status }));
  }
  toggleNotifications(): void {
    this.showNotifications = !this.showNotifications;
  }


}
