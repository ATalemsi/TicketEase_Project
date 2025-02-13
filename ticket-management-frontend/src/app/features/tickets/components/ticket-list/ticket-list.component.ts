import { Component } from '@angular/core';
import {selectLoading, selectTickets} from "../../store/ticket.selectors";
import {Store} from "@ngrx/store";
import {loadTickets} from "../../store/ticket.actions";

@Component({
  selector: 'app-ticket-list',
  standalone: true,
  imports: [],
  templateUrl: './ticket-list.component.html',
  styleUrl: './ticket-list.component.css'
})
export class TicketListComponent {
  tickets$ = this.store.select(selectTickets);
  loading$ = this.store.select(selectLoading);

  constructor(private readonly store: Store) {}

  ngOnInit(): void {
    this.store.dispatch(loadTickets({ pageable: { page: 0, size: 10 } }));
  }

}
