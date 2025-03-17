import {Component, OnDestroy, OnInit} from '@angular/core';
import {map, Observable, Subscription} from "rxjs";
import {TicketResponse, User} from "../../../shared/models/ticket-response.model";
import {FormBuilder, FormGroup, ReactiveFormsModule, Validators} from "@angular/forms";

import {
  selectAgents,
  selectAllTickets,
  selectError,
  selectLoading,
  selectUnassignedTickets,
  selectUsers
} from "../store/admin.selectors";
import {Store} from "@ngrx/store";
import {Page} from "../../../shared/models/page.model";
import {AdminActions} from "../store/admin.actions";
import {SidebarComponent} from "../../../shared/components/sidebar/sidebar.component";
import {AuthState} from "../../auth/store/auth.reducer";
import {AsyncPipe, DatePipe, NgClass, NgForOf, NgIf} from "@angular/common";
import {Actions, ofType} from "@ngrx/effects";
import {AdminState} from "../store/admin.reducer";
import {take} from "rxjs/operators";

interface AppState {
  auth: AuthState;
  admin: AdminState;
}
@Component({
  selector: 'app-ticket-assignment',
  standalone: true,
  imports: [
    SidebarComponent,
    NgIf,
    AsyncPipe,
    ReactiveFormsModule,
    NgClass,
    NgForOf,
    DatePipe
  ],
  templateUrl: './ticket-assignment.component.html',
  styleUrl: './ticket-assignment.component.css'
})
export class TicketAssignmentComponent implements OnInit , OnDestroy {
  unassignedTickets$: Observable<Page<TicketResponse> | null> | undefined;
  agents$: Observable<User[] | null>;
  loading$: Observable<boolean>;
  error$: Observable<string | null>;
  userRole$: Observable<string | null>;

  private readonly subscriptions: Subscription[] = [];

  currentPage = 0;
  pageSize = 10;

  assignmentForm: FormGroup;
  notificationMessage: string | null = null;

  constructor(
    private readonly store: Store<AppState>,
    private readonly fb: FormBuilder,

  ) {
    this.unassignedTickets$ = this.store.select(selectUnassignedTickets);
    this.agents$ = this.store.select(selectAgents);
    this.loading$ = this.store.select(selectLoading);
    this.error$ = this.store.select(selectError);
    this.userRole$ = this.store.select((state) => state.auth.role);

    this.assignmentForm = this.fb.group({
      ticketId: ['', Validators.required],
      agentId: ['', Validators.required]
    });
  }

  ngOnInit(): void {

    this.loadUnassignedTickets();
    this.loadData();
  }

  ngOnDestroy(): void {
    // Clean up all subscriptions
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }

  loadData(): void {
    this.notificationMessage = null;
    this.store.dispatch(AdminActions.loadUnassignedTickets({
      page: this.currentPage,
      size: this.pageSize
    }));
    this.store.dispatch(AdminActions.loadAgents());
  }

  loadUnassignedTickets(): void {
    this.store.dispatch(AdminActions.loadUnassignedTickets({
      page: this.currentPage,
      size: this.pageSize
    }));
  }

  onAssignTicket(): void {
    if (this.assignmentForm.valid) {
      const { ticketId, agentId } = this.assignmentForm.value;
      this.store.dispatch(AdminActions.assignTicket({
        ticketId,
        agentId
      }));
      // Show notification
      this.notificationMessage = `Assigning ticket #${ticketId} to agent...`;

      this.assignmentForm.reset();

      setTimeout(() => {
        this.loadData();
      }, 1000);
    }
  }

  selectTicket(ticketId: number): void {
    // Set the selected ticket in the form
    this.assignmentForm.patchValue({ ticketId });

    // Scroll to the form
    const formElement = document.querySelector('.assignment-form');
    if (formElement) {
      formElement.scrollIntoView({ behavior: 'smooth' });
    }
  }

  getStatusClass(status: string): string {
    switch (status?.toUpperCase()) {
      case 'NEW':
        return 'bg-purple-100 text-purple-800';
      case 'OPEN':
        return 'bg-yellow-100 text-yellow-800';
      case 'IN_PROGRESS':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-slate-100 text-slate-800';
    }
  }

  getPriorityClass(priority: string): string {
    switch (priority?.toUpperCase()) {
      case 'LOW':
        return 'bg-blue-100 text-blue-800';
      case 'MEDIUM':
        return 'bg-yellow-100 text-yellow-800';
      case 'HIGH':
        return 'bg-orange-100 text-orange-800';
      case 'CRITICAL':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-slate-100 text-slate-800';
    }
  }

}
