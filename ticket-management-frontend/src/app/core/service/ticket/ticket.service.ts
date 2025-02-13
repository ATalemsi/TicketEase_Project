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
  private readonly apiUrl = `${environment.apiUrl}/api/tickets`;

  constructor(private readonly http: HttpClient) {}

  createTicket(request: TicketCreateRequest): Observable<TicketResponse> {
    return this.http.post<TicketResponse>(this.apiUrl, request);
  }

  updateTicket(id: number, request: TicketUpdateRequest): Observable<TicketResponse> {
    return this.http.put<TicketResponse>(`${this.apiUrl}/${id}`, request);
  }

  getAllTickets(pageable: Pageable): Observable<Page<TicketResponse>> {
    const params = new HttpParams()
      .set('page', pageable.page.toString())
      .set('size', pageable.size.toString())
      .set('sort', pageable.sort ?? '');

    return this.http.get<Page<TicketResponse>>(this.apiUrl, { params });
  }

  getMyTickets(userId: number, pageable: Pageable): Observable<Page<TicketResponse>> {
    const params = new HttpParams()
      .set('page', pageable.page.toString())
      .set('size', pageable.size.toString())
      .set('sort', pageable.sort ?? '');

    return this.http.get<Page<TicketResponse>>(`${this.apiUrl}/my-tickets`, { params });
  }

  // Get tickets assigned to the current user (agent)
  getAssignedTickets(userId: number, pageable: Pageable): Observable<Page<TicketResponse>> {
    const params = new HttpParams()
      .set('page', pageable.page.toString())
      .set('size', pageable.size.toString())
      .set('sort', pageable.sort ?? '');

    return this.http.get<Page<TicketResponse>>(`${this.apiUrl}/assigned`, { params });
  }


}
