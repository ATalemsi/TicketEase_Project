import {Component, OnDestroy, OnInit} from '@angular/core';
import {TicketResponse} from '../../../shared/models/ticket-response.model';
import {EMPTY, map, Observable, Subject, switchMap, takeUntil, tap} from "rxjs";
import {Store} from "@ngrx/store";
import {loadMyTickets, LoadMyTicketsPayload} from "../../tickets/store/ticket.actions";
import {selectLoading, selectMyTickets} from "../../tickets/store/ticket.selectors";
import {Page} from "../../../shared/models/page.model";
import {filter, take} from "rxjs/operators";
import {FormsModule} from "@angular/forms";
import {AsyncPipe, DatePipe, NgClass, NgForOf, NgIf, TitleCasePipe} from "@angular/common";
import {RouterLink} from "@angular/router";
import {LucideAngularModule} from 'lucide-angular';
import {SidebarComponent} from "../../../shared/components/sidebar/sidebar.component";
import {AuthState} from "../../auth/store/auth.reducer";
import {selectUserId} from "../../auth/store/auth.selectors";
import {WebsocketService} from "../../../core/service/websocket/websocket.service";

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    FormsModule,
    AsyncPipe,
    NgIf,
    NgForOf,
    NgClass,
    DatePipe,
    RouterLink,
    LucideAngularModule,
    SidebarComponent,
    TitleCasePipe
  ],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css'
})
export class DashboardComponent implements OnInit, OnDestroy {
  tickets$: Observable<Page<TicketResponse> | null>;
  userRole$: Observable<string | null>;
  loading$: Observable<boolean>;
  userId$: Observable<string | null>;
  notifications$: Observable<any[]>;
  unreadCount$: Observable<number>;
  showNotifications = false;


  // Notification message
  notificationMessage: string | null = null;

  // Stats counters
  totalTickets: number = 0;
  openTickets: number = 0;
  inProgressTickets: number = 0;
  resolvedTickets: number = 0;
  newTickets: number = 0;


  currentPage = 0;
  pageSize = 10;

  // Search and Filter
  searchQuery = '';
  selectedStatus = '';

  // Ticket Details Modal
  selectedTicket: TicketResponse | null = null;

  // Destroy subject for cleanup
  private readonly destroy$ = new Subject<void>();

  constructor(private readonly store: Store<{ auth: AuthState }>, private readonly webSocketService: WebsocketService) {
    this.tickets$ = this.store.select(selectMyTickets);
    this.loading$ = this.store.select(selectLoading);
    this.userRole$ = this.store.select((state) => state.auth.role);
    this.userId$ = this.store.select(selectUserId);
    this.notifications$ = this.webSocketService.getNotifications();
    this.unreadCount$ = this.notifications$.pipe(
      map((notifications) => notifications.filter((n) => !n.read).length)
    );
  }

  ngOnInit(): void {
    // Load tickets when userId is available
    this.userId$.pipe(
      takeUntil(this.destroy$)
    ).subscribe((userId) => {
      if (userId) {
        this.loadTickets(userId);
      }
    });

    // Update stats when tickets change
    this.tickets$.pipe(
      takeUntil(this.destroy$)
    ).subscribe((tickets) => {
      if (tickets?.content) {
        this.updateStats(tickets.content);
      }
    });
    this.userId$.pipe(takeUntil(this.destroy$)).subscribe((userId) => {
      if (userId) {
        this.webSocketService.connect(userId); // Connect with the authenticated user ID
      }
    });

    // Handle notifications with better logging and error handling
    this.notifications$.pipe(
      takeUntil(this.destroy$)
    ).subscribe((notifications) => {
      console.log('Received notifications:', notifications);
      if (notifications.length > 0) {
        this.notificationMessage = notifications[0].message;
      }
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    this.notificationMessage = null; // Clear the notification message
  }

  private loadTickets(userId: string, page: number = 0, filters?: { status?: string; search?: string }): void {
    this.currentPage = page;

    const payload: LoadMyTicketsPayload = {
      userId,
      pageable: {
        page: this.currentPage,
        size: this.pageSize
      },
      filters
    };

    this.store.dispatch(loadMyTickets(payload));
  }

  private updateStats(tickets: TicketResponse[]): void {
    this.totalTickets = tickets.length;
    this.newTickets = tickets.filter(t => t.status === 'NEW').length;
    this.openTickets = tickets.filter(t => t.status === 'OPEN').length;
    this.inProgressTickets = tickets.filter(t => t.status === 'IN_PROGRESS').length;
    this.resolvedTickets = tickets.filter(t => t.status === 'RESOLVED').length;
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
      default:
        return 'bg-gray-100 text-gray-800';
    }
  }

  applyFilters(): void {
    this.userId$.pipe(take(1)).subscribe(userId => {
      if (userId) {
        this.loadTickets(userId, 0, {
          status: this.selectedStatus || undefined,
          search: this.searchQuery || undefined
        });
      }
    });
  }

  viewTicketDetails(ticket: TicketResponse): void {
    this.selectedTicket = ticket;
  }

  closeModal(): void {
    this.selectedTicket = null;
  }


  // Pagination methods
  nextPage(): void {
    this.userId$.pipe(
      take(1),
      switchMap(userId => {
        if (!userId) return EMPTY;
        return this.tickets$.pipe(
          take(1),
          filter(tickets => !!tickets),
          tap(tickets => {
            if (this.currentPage < Math.ceil(tickets!.totalElements! / this.pageSize) - 1) {
              this.loadTickets(userId, this.currentPage + 1, {
                status: this.selectedStatus || undefined,
                search: this.searchQuery || undefined
              });
            }
          })
        );
      })
    ).subscribe();
  }

  prevPage(): void {
    this.userId$.pipe(
      take(1),
      filter(userId => !!userId),
      tap(userId => {
        if (this.currentPage > 0) {
          this.loadTickets(userId!, this.currentPage - 1, {
            status: this.selectedStatus || undefined,
            search: this.searchQuery || undefined
          });
        }
      })
    ).subscribe();
  }

  goToPage(page: number): void {
    this.userId$.pipe(
      take(1),
      filter(userId => !!userId),
      tap(userId => {
        this.loadTickets(userId!, page, {
          status: this.selectedStatus || undefined,
          search: this.searchQuery || undefined
        });
      })
    ).subscribe();
  }
  toggleNotifications(): void {
    this.showNotifications = !this.showNotifications;
  }

  markNotificationAsRead(index: number): void {
    this.webSocketService.markAsRead(index);
  }

  clearNotifications(): void {
    this.webSocketService.clearNotifications();
  }
}
