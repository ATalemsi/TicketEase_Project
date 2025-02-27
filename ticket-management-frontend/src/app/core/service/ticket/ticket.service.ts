import { Injectable } from '@angular/core';
import {environment} from "../../../../environments/environment";
import {HttpClient, HttpParams} from "@angular/common/http";
import {TicketCreateRequest} from "../../../shared/models/ticket-create-request.model";
import {Observable} from "rxjs";
import {TicketResponse} from "../../../shared/models/ticket-response.model";
import {TicketUpdateRequest} from "../../../shared/models/ticket-update-request.model";
import {Page} from "../../../shared/models/page.model";
import {Pageable} from "../../../shared/models/pageable.model";

@Injectable({
  providedIn: 'root'
})
export class TicketService {
  private readonly apiUrl = `${environment.apiUrl}/api`;

  constructor(private readonly http: HttpClient) {}

  createTicket(request: TicketCreateRequest): Observable<TicketResponse> {
    return this.http.post<TicketResponse>(`${this.apiUrl}/user/tickets`, request);
  }

  updateTicket(id: number, request: TicketUpdateRequest): Observable<TicketResponse> {
    return this.http.put<TicketResponse>(`${this.apiUrl}/${id}`, request);
  }

  getAllTickets(pageable: Pageable): Observable<Page<TicketResponse>> {
    const params = new HttpParams()
      .set('page', pageable.page.toString())
      .set('size', pageable.size.toString())
      .set('sort', pageable.sort ?? '');

    return this.http.get<Page<TicketResponse>>(`${this.apiUrl}/user/tickets`, { params });
  }

  getMyTickets(userId: string, pageable: Pageable): Observable<Page<TicketResponse>> {
    const params = new HttpParams()
      .set('page', pageable.page.toString())
      .set('size', pageable.size.toString())
      .set('sort', pageable.sort ?? '');

    return this.http.get<Page<TicketResponse>>(`${this.apiUrl}/user/tickets/my-tickets`, { params });
  }

  // Get tickets assigned to the current user (agent)
  getAssignedTickets(userId: number, pageable: Pageable): Observable<Page<TicketResponse>> {
    const params = new HttpParams()
      .set('page', pageable.page.toString())
      .set('size', pageable.size.toString())
      .set('sort', pageable.sort ?? '');

    return this.http.get<Page<TicketResponse>>(`${this.apiUrl}/assigned`, { params });
  }

  searchTicketsByClient(searchQuery?: string, status?: string, page: number = 0, size: number = 10): Observable<Page<TicketResponse>> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString());
    if (searchQuery) params = params.set('searchQuery', searchQuery);
    if (status) params = params.set('status', status);
    return this.http.get<Page<TicketResponse>>(`${this.apiUrl}/user/tickets/search`, { params });
  }

}
