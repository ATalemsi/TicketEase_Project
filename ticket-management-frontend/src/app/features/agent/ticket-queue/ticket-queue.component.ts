// ticket-queue.component.ts
import {Component, OnInit} from '@angular/core';
import { Observable } from 'rxjs';
import { TicketResponse } from '../../../shared/models/ticket-response.model';
import { AgentState } from '../store/agent.state';
import { Store } from "@ngrx/store";
import { selectError, selectLoading, selectTickets } from "../store/agent.selectors";
import { loadAssignedTickets, searchTickets } from '../store/agent.action';
import { SidebarComponent } from "../../../shared/components/sidebar/sidebar.component";
import { AsyncPipe, DatePipe, NgClass, NgForOf, NgIf, TitleCasePipe } from "@angular/common";
import { FormsModule } from "@angular/forms";
import { RouterLink } from "@angular/router";

interface TicketFilters {
  status: string;
  priority: string;
  searchQuery: string;
}

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
    RouterLink,
    TitleCasePipe
  ],
  templateUrl: './ticket-queue.component.html',
  styleUrl: './ticket-queue.component.css'
})
export class TicketQueueComponent implements OnInit {
  tickets$: Observable<TicketResponse[]>;
  loading$: Observable<boolean>;
  error$: Observable<string | null>;
  userRole$: Observable<string | null>;

  filters: TicketFilters = {
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
    this.store.dispatch(searchTickets({
      status: this.filters.status,
      priority: this.filters.priority,
      searchQuery: this.filters.searchQuery,
      page: 0,
      size: 10
    }));
  }

  getFilteredTickets(tickets: TicketResponse[], status: string): TicketResponse[] {
    return tickets.filter(ticket => ticket.status === status);
  }

  getStatusClass(status: string): string {
    switch (status.toUpperCase()) {
      case 'NEW':
        return 'bg-purple-100 text-purple-700';
      case 'OPEN':
        return 'bg-yellow-100 text-yellow-700';
      case 'IN_PROGRESS':
        return 'bg-blue-100 text-blue-700';
      case 'RESOLVED':
        return 'bg-green-100 text-green-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  }

  getPriorityClass(priority: string): string {
    switch (priority.toUpperCase()) {
      case 'HIGH':
        return 'bg-red-500';
      case 'MEDIUM':
        return 'bg-orange-500';
      case 'LOW':
        return 'bg-gray-500';
      default:
        return 'bg-gray-500';
    }
  }
}
