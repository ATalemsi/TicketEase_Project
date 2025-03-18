import { Component, Input, OnInit } from '@angular/core';
import { TicketCreateRequest } from "../../../../shared/models/ticket-create-request.model";
import { TicketUpdateRequest } from "../../../../shared/models/ticket-update-request.model";
import { Observable } from "rxjs";
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from "@angular/forms";
import { Store } from "@ngrx/store";
import { Router } from "@angular/router";
import { selectLoading, selectMyTickets } from "../../store/ticket.selectors";
import { createTicket, updateTicket } from "../../store/ticket.actions";
import { SidebarComponent } from "../../../../shared/components/sidebar/sidebar.component";
import {AsyncPipe, NgClass, NgForOf, NgIf} from "@angular/common";
import { AuthState } from "../../../auth/store/auth.reducer";
import {take} from "rxjs/operators";

@Component({
  selector: 'app-ticket-form',
  standalone: true,
  imports: [
    SidebarComponent,
    ReactiveFormsModule,
    NgIf,
    AsyncPipe,
    NgForOf,
    NgClass
  ],
  templateUrl: './ticket-form.component.html',
  styleUrl: './ticket-form.component.css'
})
export class TicketFormComponent implements OnInit {
  @Input() mode: 'create' | 'update' = 'create';
  @Input() ticketId?: number;
  @Input() initialData?: TicketCreateRequest | TicketUpdateRequest;

  isModalOpen = false

  userRole$: Observable<string | null>

  sidebarOpen = false; // Start closed on mobile
  isMobile = false;
  ticketForm!: FormGroup<any>; // Use definite assignment assertion
  loading$: Observable<boolean>;
  submitted = false;
  canCreateTicket = true; // Flag to check if the user can create a ticket
  newTicketCount = 0; // Number of NEW tickets

  priorityOptions = [
    { value: 'LOW', label: 'Low' },
    { value: 'MEDIUM', label: 'Medium' },
    { value: 'HIGH', label: 'High' }
  ];

  statusOptions = [
    { value: 'OPEN', label: 'Open' },
    { value: 'IN_PROGRESS', label: 'In Progress' },
    { value: 'RESOLVED', label: 'Resolved' },
    { value: 'CLOSED', label: 'Closed' }
  ];

  constructor(
    private readonly fb: FormBuilder,
    private readonly store: Store<{ auth: AuthState }>,
    protected readonly router: Router
  ) {
    this.loading$ = this.store.select(selectLoading);
    this.userRole$ = this.store.select((state) => state.auth.role)
  }

  ngOnInit(): void {
    // Initialize form based on mode
    if (this.mode === 'create') {
      this.initCreateForm();
      this.checkTicketLimit(); // Check if the user can create a new ticket
    } else {
      this.initUpdateForm();
    }
    if (this.initialData) {
      this.ticketForm.patchValue(this.initialData);
    }

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
  // Sidebar toggle method
  toggleSidebar(): void {
    console.log('Toggling sidebar'); // Debug log
    this.sidebarOpen = !this.sidebarOpen;
  }

  private initCreateForm(): void {
    this.ticketForm = this.fb.group({
      title: ['', [Validators.required, Validators.minLength(5), Validators.maxLength(100)]],
      description: ['', [Validators.required, Validators.minLength(10), Validators.maxLength(500)]],
      priority: ['MEDIUM', Validators.required],
      status: ['NEW'] // Default status for new tickets
    });
  }

  private initUpdateForm(): void {
    this.ticketForm = this.fb.group({
      title: ['', [Validators.minLength(5), Validators.maxLength(100)]],
      description: ['', [Validators.minLength(10), Validators.maxLength(500)]],
      priority: [''],
      agentId: [null as string | null]
    });
  }

  private checkTicketLimit(): void {
    this.store.select(selectMyTickets).pipe(take(1)).subscribe((tickets) => {
      if (tickets) {
        this.newTicketCount = tickets.content.filter(ticket => ticket.status === 'NEW').length;

        if (this.newTicketCount > 5) {
          this.canCreateTicket = false;
          this.ticketForm.disable();
        }
      }
    });
  }

  onSubmit(): void {
    this.submitted = true;

    if (this.ticketForm.valid && this.canCreateTicket) {
      const formValue = this.ticketForm.value;

      if (this.mode === 'update') {
        // Create type-safe update request
        const updateRequest: TicketUpdateRequest = {};

        // Explicitly check each possible field
        if (formValue.title !== null && formValue.title !== '') {
          updateRequest.title = formValue.title;
        }
        if (formValue.description !== null && formValue.description !== '') {
          updateRequest.description = formValue.description;
        }
        if (formValue.status !== null && formValue.status !== '') {
          updateRequest.status = formValue.status;
        }
        if (formValue.priority !== null && formValue.priority !== '') {
          updateRequest.priority = formValue.priority;
        }
        if (formValue.agentId !== null && formValue.agentId !== '') {
          updateRequest.agentId = Number(formValue.agentId);
        }

        this.store.dispatch(updateTicket({
          id: this.ticketId!,
          request: updateRequest
        }));
      } else {
        // For create, we know all required fields are present due to validation
        const createRequest: TicketCreateRequest = {
          title: formValue.title,
          description: formValue.description,
          priority: formValue.priority
        };

        this.store.dispatch(createTicket({
          request: createRequest
        }));
      }
    }
  }

  get f() { return this.ticketForm.controls; }

  getFieldError(fieldName: string): string {
    const control = this.f[fieldName];
    if (control?.errors && (control.dirty || control.touched || this.submitted)) {
      if (control.errors['required']) return `${fieldName.charAt(0).toUpperCase() + fieldName.slice(1)} is required`;
      if (control.errors['minlength']) return `${fieldName.charAt(0).toUpperCase() + fieldName.slice(1)} must be at least ${control.errors['minlength'].requiredLength} characters`;
      if (control.errors['maxlength']) return `${fieldName.charAt(0).toUpperCase() + fieldName.slice(1)} cannot exceed ${control.errors['maxlength'].requiredLength} characters`;
    }
    return '';
  }
}
