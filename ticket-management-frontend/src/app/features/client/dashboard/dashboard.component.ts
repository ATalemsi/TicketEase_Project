import { Component, OnDestroy, OnInit } from "@angular/core"
import { TicketResponse } from "../../../shared/models/ticket-response.model"
import { map, Observable, Subject, takeUntil } from "rxjs"
import { Store } from "@ngrx/store"
import {
  deleteTicket,
  loadMyTickets,
  LoadMyTicketsPayload,
  searchTicketsByClient,
  updateTicketStatus,
} from "../../tickets/store/ticket.actions"
import { selectLoading, selectMyTickets } from "../../tickets/store/ticket.selectors"
import { Page } from "../../../shared/models/page.model"
import {  take } from "rxjs/operators"
import { FormsModule } from "@angular/forms"
import { AsyncPipe, DatePipe, NgClass, NgForOf, NgIf, TitleCasePipe } from "@angular/common"
import { RouterLink } from "@angular/router"
import { LucideAngularModule } from "lucide-angular"
import { SidebarComponent } from "../../../shared/components/sidebar/sidebar.component"
import { AuthState } from "../../auth/store/auth.reducer"
import { selectUserId } from "../../auth/store/auth.selectors"
import { WebsocketService } from "../../../core/service/websocket/websocket.service"

interface NotificationMessage {
  message: string
  timestamp: string
  read: boolean
}
@Component({
  selector: "app-dashboard",
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
    TitleCasePipe,
  ],
  templateUrl: "./dashboard.component.html",
  styleUrl: "./dashboard.component.css",
})
export class DashboardComponent implements OnInit, OnDestroy {
  tickets$: Observable<Page<TicketResponse> | null>
  userRole$: Observable<string | null>
  loading$: Observable<boolean>
  userId$: Observable<string | null>
  notifications$: Observable<NotificationMessage[]> // Updated to handle NotificationMessage[]
  showNotifications = false
  isModalOpen = false

  sidebarOpen = false; // Start closed on mobile
  isMobile = false;

  // Filtered tickets observables
  newTickets$: Observable<TicketResponse[]>
  inProgressTickets$: Observable<TicketResponse[]>
  resolvedTickets$: Observable<TicketResponse[]>
  notResolvedTickets$: Observable<TicketResponse[]> // Added observable for NOT_RESOLVED tickets

  notificationMessage: string | null = null

  // Stats counters
  totalTickets = 0
  openTickets = 0
  inProgressTickets = 0
  resolvedTickets = 0
  newTickets = 0
  notResolvedTickets = 0 // Added counter for NOT_RESOLVED tickets

  currentPage = 0
  pageSize = 10

  // Search and Filter
  searchQuery = ""
  selectedStatus = ""

  // Ticket Details Modal
  selectedTicket: TicketResponse | null = null

  private readonly destroy$ = new Subject<void>()

  constructor(
    private readonly store: Store<{ auth: AuthState }>,
    private readonly webSocketService: WebsocketService,
  ) {
    this.tickets$ = this.store.select(selectMyTickets)
    this.loading$ = this.store.select(selectLoading)
    this.userRole$ = this.store.select((state) => state.auth.role)
    this.userId$ = this.store.select(selectUserId)
    this.notifications$ = this.webSocketService.getNotifications() // Updated to handle NotificationMessage[]

    // Create filtered observables
    this.newTickets$ = this.tickets$.pipe(
      map((page) => page?.content.filter((ticket) => ticket.status === "NEW") ?? []),
    )
    this.inProgressTickets$ = this.tickets$.pipe(
      map((page) => page?.content.filter((ticket) => ticket.status === "IN_PROGRESS") ?? []),
    )
    this.resolvedTickets$ = this.tickets$.pipe(
      map((page) => page?.content.filter((ticket) => ticket.status === "RESOLVED") ?? []),
    )
    this.notResolvedTickets$ = this.tickets$.pipe(
      map((page) => page?.content.filter((ticket) => ticket.status === "NOT_RESOLVED") ?? []),
    )

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
    this.userId$.pipe(takeUntil(this.destroy$)).subscribe((userId) => {
      if (userId) {
        this.loadTickets(userId) // Subscribe to user-specific notifications
      }
    })

    this.tickets$.pipe(takeUntil(this.destroy$)).subscribe((tickets) => {
      if (tickets?.content) {
        this.updateStats(tickets.content)
      }
    })

    this.userId$.pipe(takeUntil(this.destroy$)).subscribe((userId) => {
      if (userId) {
        this.webSocketService.connect(userId, this.userRole$)
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

  applyFilters(): void {
    console.log("Applying filters:", {
      status: this.selectedStatus,
      searchQuery: this.searchQuery,
      page: this.currentPage,
      size: this.pageSize,
    })
    this.store.dispatch(
      searchTicketsByClient({
        status: this.selectedStatus,
        searchQuery: this.searchQuery,
        page: this.currentPage,
        size: this.pageSize,
      }),
    )
  }

  ngOnDestroy(): void {
    window.removeEventListener('resize', () => this.checkMobile());
    this.destroy$.next();
    this.destroy$.complete();
    this.notificationMessage = null;
  }

  private loadTickets(userId: string, page = 0, filters?: { status?: string; search?: string }): void {
    this.currentPage = page

    const payload: LoadMyTicketsPayload = {
      userId,
      pageable: {
        page: this.currentPage,
        size: this.pageSize,
      },
      filters,
    }

    this.store.dispatch(loadMyTickets(payload))
  }

  private updateStats(tickets: TicketResponse[]): void {
    this.totalTickets = tickets.length
    this.newTickets = tickets.filter((t) => t.status === "NEW").length
    this.openTickets = tickets.filter((t) => t.status === "OPEN").length
    this.inProgressTickets = tickets.filter((t) => t.status === "IN_PROGRESS").length
    this.resolvedTickets = tickets.filter((t) => t.status === "RESOLVED").length
    this.notResolvedTickets = tickets.filter((t) => t.status === "NOT_RESOLVED").length // Count NOT_RESOLVED tickets
  }

  getStatusClass(status: string): string {
    switch (status.toUpperCase()) {
      case "NEW":
        return "bg-purple-100 text-purple-800"
      case "OPEN":
        return "bg-yellow-100 text-yellow-800"
      case "IN_PROGRESS":
        return "bg-blue-100 text-blue-800"
      case "RESOLVED":
        return "bg-green-100 text-green-800"
      case "NOT_RESOLVED":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  viewTicketDetails(ticket: TicketResponse): void {
    this.selectedTicket = ticket
  }

  closeModal(): void {
    this.isModalOpen = false
    this.selectedTicket = null
  }

  openModal(ticket: TicketResponse): void {
    this.selectedTicket = ticket
    this.isModalOpen = true
  }

  deleteTicket(ticketId: number): void {
    if (confirm("Are you sure you want to delete this ticket? This action cannot be undone.")) {
      if (this.selectedTicket && this.selectedTicket.status === "NEW") {
        this.store.dispatch(deleteTicket({ticketId}))

        // Update the selected ticket status locally to ensure UI consistency
        this.selectedTicket = {
          ...this.selectedTicket,
          status: "NEW",
        }
        // Show a success notification
        this.notificationMessage = "Ticket has been deleted successfully."

        // Close the modal if it's open
        if (this.selectedTicket && this.selectedTicket.id === ticketId) {
          this.closeModal()
        }

        // Reload tickets after a short delay to ensure the backend has processed the update
        setTimeout(() => {
          this.userId$.pipe(take(1)).subscribe((userId) => {
            if (userId) {
              this.loadTickets(userId)
            }
          })
        }, 500)
      }
    }
  }

  toggleNotifications(): void {
    this.showNotifications = !this.showNotifications
  }

  markNotificationAsRead(index: number): void {
    this.webSocketService.markAsRead(index)
  }

  clearNotifications(): void {
    this.webSocketService.clearNotifications()
  }

  resolveTicket(ticketId: number): void {
    if (this.selectedTicket && this.selectedTicket.status === "IN_PROGRESS") {
      this.store.dispatch(updateTicketStatus({ ticketId, status: "RESOLVED" }))

      // Update the selected ticket status locally to ensure UI consistency
      this.selectedTicket = {
        ...this.selectedTicket,
        status: "RESOLVED",
      }

      // Reload tickets after a short delay to ensure the backend has processed the update
      setTimeout(() => {
        this.userId$.pipe(take(1)).subscribe((userId) => {
          if (userId) {
            this.loadTickets(userId)
          }
        })
      }, 500)

      // Show a success notification
      this.notificationMessage = "Ticket has been marked as resolved successfully."

      // Close the modal
      this.closeModal()
    }
  }

  markAsNotResolved(ticketId: number): void {
    if (
      this.selectedTicket &&
      (this.selectedTicket.status === "RESOLVED" || this.selectedTicket.status === "IN_PROGRESS")
    ) {
      this.store.dispatch(updateTicketStatus({ ticketId, status: "NOT_RESOLVED" }))

      // Update the selected ticket status locally
      this.selectedTicket = {
        ...this.selectedTicket,
        status: "NOT_RESOLVED",
      }

      // Reload tickets after a short delay
      setTimeout(() => {
        this.userId$.pipe(take(1)).subscribe((userId) => {
          if (userId) {
            this.loadTickets(userId)
          }
        })
      }, 500)

      // Show notification
      this.notificationMessage = "Ticket marked as not resolved. An agent will review it soon."

      // Close the modal
      this.closeModal()
    }
  }
}
