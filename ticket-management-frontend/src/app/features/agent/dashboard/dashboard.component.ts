import {Component, OnDestroy, OnInit} from '@angular/core';
import {TicketResponse} from "../../../shared/models/ticket-response.model";
import {Observable, map, Subject, takeUntil} from "rxjs";
import {Store} from "@ngrx/store";
import { loadAssignedTickets, updateTicketStatus} from "../store/agent.action";
import {selectError, selectLoading, selectTickets} from "../store/agent.selectors";
import {AsyncPipe, DatePipe, NgClass, NgForOf, NgIf, TitleCasePipe} from "@angular/common";
import {SidebarComponent} from "../../../shared/components/sidebar/sidebar.component";
import {AuthState} from "../../auth/store/auth.reducer";
import {selectUserId} from "../../auth/store/auth.selectors";
import {WebsocketService} from "../../../core/service/websocket/websocket.service";
import {RouterLink} from "@angular/router";

interface NotificationMessage {
  message: string
  timestamp: string
  read: boolean
}
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
  userId$: Observable<string | null>;
  notifications$: Observable<NotificationMessage[]>// Add userId observable
  showNotifications = false;
  private readonly destroy$ = new Subject<void>();

  notificationMessage: string | null = null;

  isModalOpen = false

  sidebarOpen = false; // Start closed on mobile
  isMobile = false;


  // Derived observables for ticket counts
  openTicketsCount$: Observable<number>;
  inProgressTicketsCount$: Observable<number>;
  resolvedTicketsCount$: Observable<number>;
  closedTicketsCount$: Observable<number>;
  notResolvedTicketsCount$: Observable<number>;

  constructor(private readonly store: Store<{ auth: AuthState }> ,  private readonly webSocketService: WebsocketService,) {
    this.tickets$ = this.store.select(selectTickets);
    this.loading$ = this.store.select(selectLoading);
    this.error$ = this.store.select(selectError);
    this.userRole$ = this.store.select((state) => state.auth.role);
    this.userId$ = this.store.select(selectUserId);
    this.notifications$ = this.webSocketService.getNotifications()// Use the selector


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
    this.notResolvedTicketsCount$ = this.tickets$.pipe(
      map(tickets => tickets ? tickets.filter(t => t.status === 'NOT_RESOLVED').length : 0)
    );


    // Initialize mobile detection
    this.checkMobile();
    this.sidebarOpen = !this.isMobile;

    // Add resize listener
    window.addEventListener('resize', () => this.checkMobile());
  }

  private checkMobile(): void {
    const wasMobile = this.isMobile;
    this.isMobile = window.innerWidth < 1024;

    // Close sidebar automatically on mobile
    if (!wasMobile && this.isMobile) {
      this.sidebarOpen = false;
    }
    // Open sidebar automatically on desktop
    if (wasMobile && !this.isMobile) {
      this.sidebarOpen = true;
    }
  }

  ngOnInit(): void {
    this.store.dispatch(loadAssignedTickets());

    this.userId$.pipe(takeUntil(this.destroy$)).subscribe((userId) => {
      if (userId) {
        this.webSocketService.connect(userId, this.userRole$);
      }
    })
    this.notifications$.pipe(takeUntil(this.destroy$)).subscribe((notifications) => {
      console.log("Received notifications:", notifications)
      if (notifications.length > 0) {
        this.notificationMessage = notifications[0].message
      }
    })

    this.checkMobile();
  }


  // Sidebar toggle method
  toggleSidebar(): void {
    console.log('Toggling sidebar'); // Debug log
    this.sidebarOpen = !this.sidebarOpen;
  }

  ngOnDestroy(): void {
    window.removeEventListener('resize', () => this.checkMobile());
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
  markNotificationAsRead(index: number): void {
    this.webSocketService.markAsRead(index)
  }

  clearNotifications(): void {
    this.webSocketService.clearNotifications()
  }


}
