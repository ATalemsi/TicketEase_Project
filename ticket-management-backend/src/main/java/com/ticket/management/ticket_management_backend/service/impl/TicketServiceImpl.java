package com.ticket.management.ticket_management_backend.service.impl;

import com.ticket.management.ticket_management_backend.dto.request.TicketCreateRequest;
import com.ticket.management.ticket_management_backend.dto.response.TicketResponse;
import com.ticket.management.ticket_management_backend.dto.update.TicketUpdateRequest;
import com.ticket.management.ticket_management_backend.exception.ResourceNotFoundException;
import com.ticket.management.ticket_management_backend.mapper.TicketMapper;
import com.ticket.management.ticket_management_backend.model.Ticket;
import com.ticket.management.ticket_management_backend.model.User;
import com.ticket.management.ticket_management_backend.repository.TicketRepository;
import com.ticket.management.ticket_management_backend.repository.UserRepository;
import com.ticket.management.ticket_management_backend.service.NotificationService;
import com.ticket.management.ticket_management_backend.service.TicketService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Optional;

@Service
@RequiredArgsConstructor
public class TicketServiceImpl implements TicketService {

    private TicketRepository ticketRepository;
    private TicketMapper ticketMapper;
    private final NotificationService notificationService;
    private final UserRepository userRepository;

    @Override
    @Transactional
    public TicketResponse createTicket(TicketCreateRequest request, User creator) {
        Ticket ticket = ticketMapper.toEntity(request);
        ticket.setCreator(creator);

        Ticket savedTicket = ticketRepository.save(ticket);
        notificationService.notifyNewTicket(savedTicket);

        return ticketMapper.toResponse(savedTicket);
    }

    @Override
    public TicketResponse updateTicket(Long id, TicketUpdateRequest request) {

        Ticket ticket = ticketRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Ticket not found"));

        ticketMapper.updateTicketFromRequest(request, ticket);

        if (request.getAssignedAgentId() != null) {
            User agent = userRepository.findById(request.getAssignedAgentId())
                    .orElseThrow(() -> new ResourceNotFoundException("Assigned agent not found"));
            ticket.setAssignedAgent(agent);
            notificationService.notifyTicketAssigned(ticket);
        }
        Ticket updatedTicket = ticketRepository.save(ticket);
        return ticketMapper.toResponse(updatedTicket);
    }

    @Override
    public Page<TicketResponse> getTickets(Pageable pageable) {
        return ticketRepository.findAll(pageable)
                .map(ticketMapper::toResponse);
    }

    @Override
    public Page<TicketResponse> getTicketsByAgent(Long agentId, Pageable pageable) {
        return ticketRepository.findByAssignedAgentId(agentId, pageable)
                .map(ticketMapper::toResponse);
    }

    @Override
    public Page<TicketResponse> getTicketsByCreator(Long creatorId, Pageable pageable) {
        return ticketRepository.findByCreatorId(creatorId, pageable)
                .map(ticketMapper::toResponse);
    }
}
