package com.ticket.management.ticket_management_backend.service;

import com.ticket.management.ticket_management_backend.dto.request.TicketCreateRequest;
import com.ticket.management.ticket_management_backend.dto.response.TicketResponse;
import com.ticket.management.ticket_management_backend.dto.update.TicketStatusUpdateRequest;
import com.ticket.management.ticket_management_backend.dto.update.TicketUpdateRequest;
import com.ticket.management.ticket_management_backend.model.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface TicketService {
    TicketResponse createTicket(TicketCreateRequest request, User creator);
    TicketResponse updateTicket(Long id, TicketUpdateRequest request);
    Page<TicketResponse> getTickets(Pageable pageable);
    Page<TicketResponse> getTicketsByAgent(Long agentId, Pageable pageable);
    Page<TicketResponse> getTicketsByCreator(Long creatorId, Pageable pageable);

    // Update the status of a ticket
    TicketResponse updateTicketStatus(Long id, TicketStatusUpdateRequest request);

    // Add a comment to a ticket
    TicketResponse addComment(Long id, String comment, Long agentId);

    // Search and filter tickets assigned to an AGENT
    Page<TicketResponse> searchTicketsByAgent(Long agentId, String status, String priority, String searchQuery, Pageable pageable);

    Page<TicketResponse> searchTicketsByClient(Long agentId, String status, String searchQuery, Pageable pageable);

    // New method
    TicketResponse getTicketById(Long id);
}
