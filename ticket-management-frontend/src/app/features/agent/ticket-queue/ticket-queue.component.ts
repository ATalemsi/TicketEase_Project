import {Component, OnInit} from '@angular/core';
import { Observable } from 'rxjs';
import { TicketResponse } from '../../../shared/models/ticket-response.model';
import { AgentState } from '../store/agent.state';
import {Store} from "@ngrx/store";
import {selectError, selectLoading, selectTickets} from "../store/agent.selectors";
import {loadAssignedTickets, searchTickets, updateTicketStatus} from '../store/agent.action';
import {SidebarComponent} from "../../../shared/components/sidebar/sidebar.component";
import {AsyncPipe, DatePipe, NgClass, NgForOf, NgIf} from "@angular/common";
import {FormsModule} from "@angular/forms";
import {RouterLink} from "@angular/router";

@Component({
  selector: 'app-ticket-queue',
  standalone: true,
  imports: [
    SidebarComponent,
    AsyncPipe,
    FormsModule,
    NgClass,
    NgIf,
    NgForOf,
    DatePipe,
    RouterLink
  ],
  templateUrl: './ticket-queue.component.html',
  styleUrl: './ticket-queue.component.css'
})
export class TicketQueueComponent implements OnInit {
  tickets$: Observable<TicketResponse[]>;
  loading$: Observable<boolean>;
  error$: Observable<string | null>;
  userRole$: Observable<string | null>;

  filters = {
    status: '',
    priority: '',
    searchQuery: ''
  };

  constructor(private readonly store: Store<{ agent: AgentState, auth: { role: string } }>) {
    this.tickets$ = this.store.select(selectTickets);
    this.loading$ = this.store.select(selectLoading);
    this.error$ = this.store.select(selectError);
    this.userRole$ = this.store.select(state => state.auth.role);
  }

  ngOnInit(): void {
    this.loadTickets();
  }

  loadTickets(): void {
    this.store.dispatch(loadAssignedTickets());
  }

  applyFilters(): void {
    // We need to add a new action for filtered tickets
    this.store.dispatch(searchTickets({
      status: this.filters.status,
      priority: this.filters.priority,
      searchQuery: this.filters.searchQuery,
      page: 0,
      size: 10
    }));
  }

  assignTicket(ticketId: number): void {
    this.store.dispatch(updateTicketStatus({
      ticketId,
      status: 'IN_PROGRESS'
    }));
  }
}
