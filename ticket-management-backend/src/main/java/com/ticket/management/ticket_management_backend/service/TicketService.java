package com.ticket.management.ticket_management_backend.service;

import com.ticket.management.ticket_management_backend.dto.request.TicketCreateRequest;
import com.ticket.management.ticket_management_backend.dto.response.TicketResponse;
import com.ticket.management.ticket_management_backend.dto.update.TicketUpdateRequest;
import com.ticket.management.ticket_management_backend.model.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface TicketService {
    TicketResponse createTicket(TicketCreateRequest request, User creator);
    public TicketResponse updateTicket(Long id, TicketUpdateRequest request);
    public Page<TicketResponse> getTickets(Pageable pageable);
    public Page<TicketResponse> getTicketsByAgent(Long agentId, Pageable pageable);
    public Page<TicketResponse> getTicketsByCreator(Long creatorId, Pageable pageable);
}
