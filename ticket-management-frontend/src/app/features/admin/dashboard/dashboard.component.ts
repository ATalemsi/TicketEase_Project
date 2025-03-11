import {Component, OnInit} from '@angular/core';
import {Observable} from "rxjs";
import {Page} from "../../../shared/models/page.model";
import {TicketResponse, User} from "../../../shared/models/ticket-response.model";
import {selectAllTickets, selectError, selectLoading, selectUsers} from "../store/admin.selectors";
import {Store} from "@ngrx/store";
import {AdminActions} from "../store/admin.actions";
import {SidebarComponent} from "../../../shared/components/sidebar/sidebar.component";
import {AuthState} from "../../auth/store/auth.reducer";
import {AsyncPipe, DatePipe, NgClass, NgForOf, NgIf} from "@angular/common";

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    SidebarComponent,
    AsyncPipe,
    NgIf,
    NgClass,
    NgForOf,
    DatePipe
  ],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css'
})
export class DashboardComponent implements OnInit{
  tickets$: Observable<Page<TicketResponse> | null>;
  users$: Observable<User[] | null>;
  loading$: Observable<boolean>;
  userRole$: Observable<string | null>;
  error$: Observable<string | null>;



  currentPage = 0;
  pageSize = 10;


  // Active tab for users section
  activeUserTab: 'client' | 'agent' = 'client';

  constructor(private readonly store: Store<{ auth: AuthState }>) {
    this.tickets$ = this.store.select(selectAllTickets);
    this.users$ = this.store.select(selectUsers);
    this.loading$ = this.store.select(selectLoading);
    this.error$ = this.store.select(selectError);
    this.userRole$ = this.store.select((state) => state.auth.role);
  }

  ngOnInit(): void {
    this.loadTickets();
    this.loadUsers();
    console.log(this.users$);
  }

  loadTickets(): void {
    this.store.dispatch(AdminActions.loadTickets({
      page: this.currentPage,
      size: this.pageSize
    }));
  }

  loadUsers(): void {
    this.store.dispatch(AdminActions.loadUsers());
  }
  onPageChange(page: number): void {
    this.currentPage = page;
    this.loadTickets();
  }

  setActiveUserTab(tab: 'client' | 'agent'): void {
    this.activeUserTab = tab;
  }

  getFilteredUsers(users: User[] | null, role: string): User[] {
    if (!users) return [];
    return users.filter(user => user.role === role);
  }

  getOpenTicketsCount(tickets: Page<TicketResponse> | null): number {
    if (!tickets || !tickets.content) return 0;
    return tickets.content.filter(t =>
      t.status === 'OPEN' || t.status === 'IN_PROGRESS'
    ).length;
  }

  getStatusClass(status: string): string {
    switch (status.toUpperCase()) {
      case 'NEW':
        return 'bg-purple-100 text-purple-800';
      case 'OPEN':
        return 'bg-yellow-100 text-yellow-800';
      case 'IN_PROGRESS':
        return 'bg-blue-100 text-blue-800';
      case 'RESOLVED':
        return 'bg-green-100 text-green-800';
      case 'CLOSED':
        return 'bg-gray-100 text-gray-800';
      case 'NOT_RESOLVED':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  }

  getPriorityClass(priority: string): string {
    switch (priority.toUpperCase()) {
      case 'LOW':
        return 'bg-blue-100 text-blue-800';
      case 'MEDIUM':
        return 'bg-yellow-100 text-yellow-800';
      case 'HIGH':
        return 'bg-orange-100 text-orange-800';
      case 'CRITICAL':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  }

  hasNextPage(tickets: Page<TicketResponse>): boolean {
    if (!tickets) return false;
    return tickets.number! < tickets.totalPages! - 1;
  }

  getPageStart(tickets: Page<TicketResponse>): number {
    if (!tickets) return 0;
    return tickets.number! * tickets.size! + 1;
  }

  getPageEnd(tickets: Page<TicketResponse>): number {
    if (!tickets) return 0;
    return Math.min((tickets.number! + 1) * tickets.size!, tickets.totalElements!);
  }

  refreshData(): void {
    this.loadTickets();
    this.loadUsers();
  }

}
