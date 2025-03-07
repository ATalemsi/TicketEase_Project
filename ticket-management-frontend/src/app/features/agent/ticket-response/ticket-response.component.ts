import {Component, OnInit} from '@angular/core';
import {map, Observable} from 'rxjs';
import { TicketResponse } from '../../../shared/models/ticket-response.model';
import { ActivatedRoute } from '@angular/router';

import { AgentState } from '../store/agent.state';
import {selectError, selectLoading, selectTickets} from "../store/agent.selectors";
import {Store} from "@ngrx/store";
import {addComment, deleteComment, loadTicketById, updateTicketStatus} from "../store/agent.action";
import {SidebarComponent} from "../../../shared/components/sidebar/sidebar.component";
import {AsyncPipe, DatePipe, NgClass, NgForOf, NgIf, TitleCasePipe} from "@angular/common";
import {FormsModule} from "@angular/forms";

@Component({
  selector: 'app-ticket-response',
  standalone: true,
  imports: [
    SidebarComponent,
    AsyncPipe,
    NgIf,
    NgClass,
    NgForOf,
    FormsModule,
    DatePipe,
    TitleCasePipe
  ],
  templateUrl: './ticket-response.component.html',
  styleUrl: './ticket-response.component.css'
})
export class TicketResponseComponent implements OnInit{
  ticket$: Observable<TicketResponse | undefined> | undefined;
  loading$: Observable<boolean>;
  error$: Observable<string | null>;
  userRole$: Observable<string | null>;
  newComment = '';
  ticketId: number | null = null;

  // @ts-ignore
  constructor(
    private readonly route: ActivatedRoute,
    private readonly store: Store<{ agent: AgentState, auth: { role: string } }>
  ) {
    this.loading$ = this.store.select(selectLoading);
    this.error$ = this.store.select(selectError);
    this.userRole$ = this.store.select(state => state.auth.role);
  }

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.ticketId = parseInt(id, 10);

      // Dispatch action to load the specific ticket
      this.store.dispatch(loadTicketById({ ticketId: this.ticketId }));

      // Select the specific ticket from the store
      this.ticket$ = this.store.select(selectTickets).pipe(
        map(tickets => tickets.find(ticket => ticket.id === this.ticketId))
      );
    }
  }

  updateStatus(ticketId: number, status: string): void {
    this.store.dispatch(updateTicketStatus({ ticketId, status }));
  }

  addComment(ticketId: number): void {
    if (this.newComment.trim()) {
      this.store.dispatch(addComment({
        ticketId,
        comment: this.newComment
      }));
      this.newComment = '';
    }
  }

  deleteComment(ticketId: number, commentId: number): void {
    this.store.dispatch(deleteComment({ ticketId, commentId }));
  }

}
