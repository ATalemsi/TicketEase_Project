import { TestBed } from '@angular/core/testing';
import { AdminServiceService } from './admin-service.service';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { environment} from "../../../../environments/environment";
import { Page} from "../../../shared/models/page.model";
import { TicketResponse, User } from '../../../shared/models/ticket-response.model';

describe('AdminServiceService', () => {
  let service: AdminServiceService;
  let httpMock: HttpTestingController;
  const apiUrl = `${environment.apiUrl}/api/admin`;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [AdminServiceService]
    });

    service = TestBed.inject(AdminServiceService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  // ✅ Test: getAllTickets
  it('should fetch all tickets', () => {
    const mockResponse: Page<TicketResponse> = {
      content: [{ id: 1, title: 'Test Ticket', status: 'open' } as TicketResponse],
      totalElements: 1,
      totalPages: 1,
      size: 10,
      number: 0,
      last: true
    };

    service.getAllTickets(0, 10).subscribe((response) => {
      expect(response).toEqual(mockResponse);
    });

    const req = httpMock.expectOne(`${apiUrl}/tickets?page=0&size=10`);
    expect(req.request.method).toBe('GET');
    req.flush(mockResponse);
  });

  // ✅ Test: getUnassignedTickets
  it('should fetch unassigned tickets', () => {
    const mockResponse: Page<TicketResponse> = { content: [], totalElements: 0, totalPages: 0, size: 10, number: 0 , last: true};

    service.getUnassignedTickets(0, 10).subscribe((response) => {
      expect(response).toEqual(mockResponse);
    });

    const req = httpMock.expectOne(`${apiUrl}/tickets/unassigned?page=0&size=10`);
    expect(req.request.method).toBe('GET');
    req.flush(mockResponse);
  });

  // ✅ Test: getTicketsByAgent
  it('should fetch tickets assigned to an agent', () => {
    const agentId = 2;
    const mockResponse: Page<TicketResponse> = { content: [], totalElements: 0, totalPages: 0, size: 10, number: 0 , last: true };

    service.getTicketsByAgent(agentId, 0, 10).subscribe((response) => {
      expect(response).toEqual(mockResponse);
    });

    const req = httpMock.expectOne(`${apiUrl}/tickets/agent/${agentId}?page=0&size=10`);
    expect(req.request.method).toBe('GET');
    req.flush(mockResponse);
  });

  // ✅ Test: getAssignedTickets
  it('should fetch assigned tickets', () => {
    const mockResponse: Page<TicketResponse> = { content: [], totalElements: 0, totalPages: 0, size: 10, number: 0 , last: true };

    service.getAssignedTickets(0, 10).subscribe((response) => {
      expect(response).toEqual(mockResponse);
    });

    const req = httpMock.expectOne(`${apiUrl}/assigned?page=0&size=10`);
    expect(req.request.method).toBe('GET');
    req.flush(mockResponse);
  });

  // ✅ Test: assignTicketToAgent
  it('should assign a ticket to an agent', () => {
    const ticketId = 1;
    const agentId = 2;
    const mockResponse: TicketResponse = { id: 1, title: 'Test Ticket', status: 'assigned' } as TicketResponse;

    service.assignTicketToAgent(ticketId, agentId).subscribe((response) => {
      expect(response).toEqual(mockResponse);
    });

    const req = httpMock.expectOne(`${apiUrl}/tickets/${ticketId}/assign/${agentId}`);
    expect(req.request.method).toBe('POST');
    req.flush(mockResponse);
  });

  // ✅ Test: getAllUsers
  it('should fetch all users', () => {
    const mockResponse: User[] = [{ id: 1, email: 'test@example.com', fullName: 'John Doe', role: 'ADMIN' } as User];

    service.getAllUsers().subscribe((response) => {
      expect(response).toEqual(mockResponse);
    });

    const req = httpMock.expectOne(`${apiUrl}/users`);
    expect(req.request.method).toBe('GET');
    req.flush(mockResponse);
  });

  // ✅ Test: getAgents
  it('should fetch all agents', () => {
    const mockResponse: User[] = [{ id: 2, email: 'agent@example.com', fullName: 'Agent Smith', role: 'AGENT' } as User];

    service.getAgents().subscribe((response) => {
      expect(response).toEqual(mockResponse);
    });

    const req = httpMock.expectOne(`${apiUrl}/users/agents`);
    expect(req.request.method).toBe('GET');
    req.flush(mockResponse);
  });

  // ✅ Test: updateUserStatus
  it('should update user status', () => {
    const userId = 1;
    const updatedUser: User = { id: userId, email: 'test@example.com', fullName: 'John Doe', role: 'ADMIN', active: false };

    service.updateUserStatus(userId, false).subscribe((response) => {
      expect(response).toEqual(updatedUser);
    });

    const req = httpMock.expectOne(`${apiUrl}/${userId}/status`);
    expect(req.request.method).toBe('PATCH');
    expect(req.request.body).toEqual({ active: false });
    req.flush(updatedUser);
  });

  // ✅ Test: getPerformanceMetrics
  it('should fetch performance metrics', () => {
    const mockMetrics = { totalTickets: 100, resolvedTickets: 90 };

    service.getPerformanceMetrics().subscribe((response) => {
      expect(response).toEqual(mockMetrics);
    });

    const req = httpMock.expectOne(`${apiUrl}/reports/performance`);
    expect(req.request.method).toBe('GET');
    req.flush(mockMetrics);
  });
});
