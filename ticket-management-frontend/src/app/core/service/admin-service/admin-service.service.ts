import { Injectable } from '@angular/core';
import {environment} from "../../../../environments/environment";
import {HttpClient, HttpParams} from '@angular/common/http';
import {Observable} from "rxjs";
import {Page} from "../../../shared/models/page.model";
import {TicketResponse, User} from "../../../shared/models/ticket-response.model";

@Injectable({
  providedIn: 'root'
})
export class AdminServiceService {

  private readonly apiUrl = `${environment.apiUrl}/api/admin`;

  constructor(private readonly http: HttpClient) {}


  getAllTickets(page: number, size: number): Observable<Page<TicketResponse>> {
    const params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString());

    return this.http.get<Page<TicketResponse>>(`${this.apiUrl}/tickets`, { params });
  }

  getTicketsByAgent(agentId: number, page: number, size: number): Observable<Page<TicketResponse>> {
    const params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString());

    return this.http.get<Page<TicketResponse>>(`${this.apiUrl}/tickets/agent/${agentId}`, { params });
  }

  getAssignedTickets(page: number, size: number): Observable<Page<TicketResponse>> {
    const params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString());

    return this.http.get<Page<TicketResponse>>(`${this.apiUrl}/assigned`, { params });
  }

  assignTicketToAgent(ticketId: number, agentId: number): Observable<TicketResponse> {
    return this.http.post<TicketResponse>(
      `${this.apiUrl}/tickets/${ticketId}/assign/${agentId}`,
      {}
    );
  }

  // Ticket assignment
  getUnassignedTickets(): Observable<TicketResponse[]> {
    return this.http.get<TicketResponse[]>(`${this.apiUrl}/tickets/unassigned`);
  }

  getAllUsers(): Observable<User[]> {
    return this.http.get<User[]>(`${this.apiUrl}/users`);
  }

  getAgents(): Observable<User[]> {
    return this.http.get<User[]>(`${this.apiUrl}/users/agents`);
  }

  updateUserStatus(userId: number, active: boolean): Observable<User> {
    return this.http.patch<User>(
      `${this.apiUrl}/${userId}/status`,
      { active }
    );
  }

  getPerformanceMetrics(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/reports/performance`);
  }
}
