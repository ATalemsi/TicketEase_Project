import { Pipe, PipeTransform } from '@angular/core';
import { TicketResponse } from '../models/ticket-response.model';

@Pipe({
  name: 'filterByStatus',
  standalone: true
})
export class FilterByStatusPipe implements PipeTransform {
  transform(tickets: TicketResponse[] | undefined, status: string): TicketResponse[] {
    if (!tickets) return [];
    return tickets.filter(ticket => ticket.status === status);
  }
}
