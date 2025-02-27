import {Injectable} from '@angular/core';
import {environment} from "../../../../environments/environment";
import {HttpClient, HttpParams} from "@angular/common/http";
import {Observable} from "rxjs";
import {Page} from "../../../shared/models/page.model";
import {TicketResponse} from "../../../shared/models/ticket-response.model";

@Injectable({
    providedIn: 'root'
})
export class AgentServiceService {
    private apiUrl = `${environment.apiUrl}/api/agent/tickets`;

    constructor(private http: HttpClient) {
    }

    getAssignedTickets(page: number, size: number): Observable<Page<TicketResponse>> {
        const params = new HttpParams()
            .set('page', page.toString())
            .set('size', size.toString());

        return this.http.get<Page<TicketResponse>>(`${this.apiUrl}/assigned`, {params});
    }

    getTicketById(ticketId: number): Observable<TicketResponse> {
        return this.http.get<TicketResponse>(`${this.apiUrl}/${ticketId}`);
    }

    updateTicketStatus(ticketId: number, status: string): Observable<TicketResponse> {
        const url = `${this.apiUrl}/${ticketId}/status`;
        return this.http.put<TicketResponse>(url, {status});
    }

    // Add a comment to a ticket
    addComment(ticketId: number, comment: string): Observable<TicketResponse> {
        const url = `${this.apiUrl}/${ticketId}/comments`;
        return this.http.post<TicketResponse>(url, null, {params: {comment}});
    }

    // Search and filter tickets assigned to the AGENT
    searchTickets(
        status: string | null,
        priority: string | null,
        searchQuery: string | null,
        page: number,
        size: number
    ): Observable<Page<TicketResponse>> {
        const params = new HttpParams()
            .set('status', status ?? '')
            .set('priority', priority ?? '')
            .set('searchQuery', searchQuery ?? '')
            .set('page', page.toString())
            .set('size', size.toString());

        return this.http.get<Page<TicketResponse>>(`${this.apiUrl}/search`, {params});
    }
}
