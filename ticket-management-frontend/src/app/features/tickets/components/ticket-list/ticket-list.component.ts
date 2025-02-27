import {Component, OnDestroy, OnInit} from '@angular/core';
import {selectLoading, selectMyTickets, selectTickets} from "../../store/ticket.selectors";
import {Store} from "@ngrx/store";
import {loadMyTickets, LoadMyTicketsPayload, loadTickets, searchTicketsByClient} from "../../store/ticket.actions";
import {EMPTY, filter, Observable, Subject, switchMap, takeUntil, tap} from "rxjs";
import {Page} from "../../../../shared/models/page.model";
import {TicketResponse} from "../../../../shared/models/ticket-response.model";
import {AuthState} from "../../../auth/store/auth.reducer";
import {WebsocketService} from "../../../../core/service/websocket/websocket.service";
import {selectUserId} from "../../../auth/store/auth.selectors";
import {take} from "rxjs/operators";
import {AsyncPipe, DatePipe, NgClass, NgForOf, NgIf, TitleCasePipe} from "@angular/common";
import {FormsModule} from "@angular/forms";
import {RouterLink} from "@angular/router";
import {SidebarComponent} from "../../../../shared/components/sidebar/sidebar.component";
import {searchTickets} from "../../../agent/store/agent.action";

@Component({
  selector: 'app-ticket-list',
  standalone: true,
  imports: [
    NgIf,
    FormsModule,
    AsyncPipe,
    NgForOf,
    NgClass,
    RouterLink,
    DatePipe,
    SidebarComponent,
    TitleCasePipe
  ],
  templateUrl: './ticket-list.component.html',
  styleUrl: './ticket-list.component.css'
})
export class TicketListComponent implements OnInit, OnDestroy {
  tickets$: Observable<Page<TicketResponse> | null>;
  loading$: Observable<boolean>;
  userId$: Observable<string | null>;
  userRole$: Observable<string | null>;

  // Notification message
  notificationMessage: string | null = null;

  searchQuery = '';
  selectedStatus = '';
  selectedPriority = ''; // Add selectedPriority

  // Pagination
  currentPage = 0;
  pageSize = 10;
  // Selected ticket for details
  selectedTicket: TicketResponse | null = null;

  // Destroy subject for cleanup
  private readonly destroy$ = new Subject<void>();

  constructor(
    private readonly store: Store<{ auth: AuthState }>,
    private webSocketService: WebsocketService
  ) {
    this.tickets$ = this.store.select(selectMyTickets);
    this.loading$ = this.store.select(selectLoading);
    this.userId$ = this.store.select(selectUserId);
    this.userRole$ = this.store.select((state) => state.auth.role);
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

    // Setup WebSocket notifications
    this.userId$.pipe(takeUntil(this.destroy$)).subscribe((userId) => {
      if (userId) {
        this.webSocketService.subscribeToUserNotifications(userId);
      }
    });

    // Listen for new notifications
    this.webSocketService.getNotifications().pipe(
      takeUntil(this.destroy$)
    ).subscribe((notifications) => {
      if (notifications.length > 0) {
        this.notificationMessage = notifications[0].message;
      }
    });
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

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    this.notificationMessage = null;
  }

  applyFilters(): void {
    console.log('Applying filters:', { status: this.selectedStatus, searchQuery: this.searchQuery, page: this.currentPage, size: this.pageSize });
    this.store.dispatch(searchTicketsByClient({
      status: this.selectedStatus,
      searchQuery: this.searchQuery,
      page: this.currentPage,
      size: this.pageSize
    }));
  }

  viewTicketDetails(ticket: TicketResponse): void {
    this.selectedTicket = ticket;
  }


  closeModal(): void {
    this.selectedTicket = null;
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
}




