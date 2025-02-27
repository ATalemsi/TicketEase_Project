import {Component, OnInit} from '@angular/core';
import {TicketResponse} from "../../../shared/models/ticket-response.model";
import {Observable, map} from "rxjs";
import {Store} from "@ngrx/store";
import {addComment, loadAssignedTickets, updateTicketStatus} from "../store/agent.action";
import {selectError, selectLoading, selectTickets} from "../store/agent.selectors";
import {AsyncPipe, DatePipe, NgClass, NgForOf, NgIf} from "@angular/common";
import {SidebarComponent} from "../../../shared/components/sidebar/sidebar.component";
import {AuthState} from "../../auth/store/auth.reducer";

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    NgIf,
    AsyncPipe,
    NgForOf,
    DatePipe,
    NgClass,
    SidebarComponent
  ],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css'
})
export class DashboardComponent implements OnInit {
  tickets$: Observable<TicketResponse[]>;
  loading$: Observable<boolean>;
  error$: Observable<string | null>;
  userRole$: Observable<string | null>;

  // Derived observables for ticket counts
  openTicketsCount$: Observable<number>;
  inProgressTicketsCount$: Observable<number>;
  resolvedTicketsCount$: Observable<number>;

  constructor(private readonly store: Store<{ auth: AuthState }>) {
    this.tickets$ = this.store.select(selectTickets);
    this.loading$ = this.store.select(selectLoading);
    this.error$ = this.store.select(selectError);
    this.userRole$ = this.store.select((state) => state.auth.role);

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
  }

  ngOnInit(): void {
    this.store.dispatch(loadAssignedTickets());
  }

  updateStatus(ticketId: number, status: string): void {
    this.store.dispatch(updateTicketStatus({ ticketId, status }));
  }

  addComment(ticketId: number, comment: string): void {
    this.store.dispatch(addComment({ ticketId, comment }));
  }
}
