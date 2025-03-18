package com.ticket.management.ticket_management_backend.service.impl;

import com.ticket.management.ticket_management_backend.dto.request.TicketCreateRequest;
import com.ticket.management.ticket_management_backend.dto.response.PerformanceMetricsResponse;
import com.ticket.management.ticket_management_backend.dto.response.TicketResponse;
import com.ticket.management.ticket_management_backend.dto.update.TicketStatusUpdateRequest;
import com.ticket.management.ticket_management_backend.dto.update.TicketUpdateRequest;
import com.ticket.management.ticket_management_backend.exception.ResourceNotFoundException;
import com.ticket.management.ticket_management_backend.mapper.TicketMapper;
import com.ticket.management.ticket_management_backend.model.Comment;
import com.ticket.management.ticket_management_backend.model.Ticket;
import com.ticket.management.ticket_management_backend.model.User;
import com.ticket.management.ticket_management_backend.model.enums.Priority;
import com.ticket.management.ticket_management_backend.model.enums.Status;
import com.ticket.management.ticket_management_backend.repository.TicketRepository;
import com.ticket.management.ticket_management_backend.repository.UserRepository;
import com.ticket.management.ticket_management_backend.service.NotificationService;
import com.ticket.management.ticket_management_backend.service.TicketService;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Duration;
import java.util.List;
import java.util.Optional;

@Service

public class TicketServiceImpl implements TicketService {

    private static final Logger log = LoggerFactory.getLogger(TicketServiceImpl.class);
    private final TicketRepository ticketRepository;
    private final TicketMapper ticketMapper;
    private final NotificationService notificationService;
    private final UserRepository userRepository;

    @Autowired // Constructor injection is preferred
    public TicketServiceImpl(
            TicketRepository ticketRepository,
            NotificationService notificationService,
            TicketMapper ticketMapper,
            UserRepository userRepository
    ) {
        this.ticketRepository = ticketRepository;
        this.notificationService = notificationService;
        this.ticketMapper = ticketMapper;
        this.userRepository = userRepository;
    }

    @Override
    @Transactional
    public TicketResponse createTicket(TicketCreateRequest request, User creator) {
        Ticket ticket = ticketMapper.toEntity(request);

        ticket.setCreator(creator);

        Ticket savedTicket = ticketRepository.save(ticket);
        notificationService.notifyNewTicket(savedTicket, creator.getId());


        if (savedTicket.getAssignedAgent() != null) {
            notificationService.notifyNewTicket(savedTicket, savedTicket.getAssignedAgent().getId());
        }

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
            notificationService.notifyTicketAssigned(ticket , agent.getId());
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

    @Override
    @Transactional
    public TicketResponse updateTicketStatus(Long id, TicketStatusUpdateRequest request) {
        try {
            log.info("Updating status for ticket ID: {}", id);
            Ticket ticket = ticketRepository.findById(id)
                    .orElseThrow(() -> new ResourceNotFoundException("Ticket not found"));

            log.info("Current status: {}, New status: {}", ticket.getStatus(), request.getStatus());
            ticket.setStatus(request.getStatus());


            if (request.getStatus().equals("RESOLVED")) {
                ticket.setResolvedAt(java.time.LocalDateTime.now());
            }

            Ticket updatedTicket = ticketRepository.save(ticket);
            log.info("Ticket status updated successfully: {}", updatedTicket);


            notificationService.notifyTicketUpdate(updatedTicket , updatedTicket.getCreator().getId());

            return ticketMapper.toResponse(updatedTicket);
        } catch (Exception e) {
            log.error("Error updating ticket status: {}", e.getMessage(), e);
            throw new RuntimeException("An unexpected error occurred", e);
        }
    }

    @Override
    @Transactional
    public void deleteComment(Long ticketId, Long commentId) {
        log.info("Deleting comment with ID: {} from ticket ID: {}", commentId, ticketId);

        Ticket ticket = ticketRepository.findById(ticketId)
                .orElseThrow(() -> new ResourceNotFoundException("Ticket not found"));

        // Find the comment to delete
        Comment comment = ticket.getComments().stream()
                .filter(c -> c.getId().equals(commentId))
                .findFirst()
                .orElseThrow(() -> new ResourceNotFoundException("Comment not found"));

        // Remove the comment from the ticket
        ticket.getComments().remove(comment);

        // Save the updated ticket
        ticketRepository.save(ticket);

        log.info("Comment deleted successfully");
    }

    @Override
    @Transactional
    public TicketResponse addComment(Long id, String comment, Long agentId) {
        Ticket ticket = ticketRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Ticket not found"));

        User agent = userRepository.findById(agentId)
                .orElseThrow(() -> new ResourceNotFoundException("Agent not found"));

        Comment newComment = Comment.builder()
                .content("AGENT (" + agent.getEmail() + "): " + comment)
                .author(agent)
                .ticket(ticket)
                .build();
        ticket.getComments().add(newComment);
        Ticket updatedTicket = ticketRepository.save(ticket);

        // Notify the customer about the new comment
        notificationService.notifyTicketAddComment(updatedTicket, updatedTicket.getCreator().getId());

        return ticketMapper.toResponse(updatedTicket);
    }

    @Override
    public Page<TicketResponse> searchTicketsByAgent(Long agentId, String status, String priority, String searchQuery, Pageable pageable) {
        try {
            log.info("Searching tickets for agent ID: {}", agentId);
            log.info("Filters - Status: {}, Priority: {}, Search Query: {}", status, priority, searchQuery);

            // Convert status from String to Status enum
            Status statusEnum = null;
            if (status != null && !status.isEmpty()) {
                try {
                    statusEnum = Status.valueOf(status);
                } catch (IllegalArgumentException e) {
                    log.warn("Invalid status value: {}", status);
                    throw new IllegalArgumentException("Invalid status value: " + status);
                }
            }

            // Convert priority from String to Priority enum
            Priority priorityEnum = null;
            if (priority != null && !priority.isEmpty()) {
                try {
                    priorityEnum = Priority.valueOf(priority);
                } catch (IllegalArgumentException e) {
                    log.warn("Invalid priority value: {}", priority);
                    throw new IllegalArgumentException("Invalid priority value: " + priority);
                }
            }

            Page<Ticket> tickets = ticketRepository.findByAssignedAgentIdAndStatusAndPriorityAndTitleContainingIgnoreCase(
                    agentId, status, statusEnum, priority, priorityEnum, searchQuery, pageable);

            log.info("Found {} tickets", tickets.getTotalElements());
            return tickets.map(ticketMapper::toResponse);
        } catch (Exception e) {
            log.error("Error searching tickets: {}", e.getMessage(), e);
            throw new RuntimeException("An unexpected error occurred", e);
        }
    }

    @Override
    public TicketResponse getTicketById(Long id) {
        log.info("Fetching ticket with ID: {}", id);
        Ticket ticket = ticketRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Ticket not found with ID: " + id));
        return ticketMapper.toResponse(ticket);
    }

    @Override
    public Page<TicketResponse> searchTicketsByClient(Long clientID, String status, String searchQuery, Pageable pageable) {
        try {
            log.info("Searching tickets for agent ID: {}", clientID);
            log.info("Filters - Status: {}, Search Query: {}", status, searchQuery);
            Status statusEnum = null;
            if (status != null && !status.isEmpty()) {
                try {
                    statusEnum = Status.valueOf(status);
                } catch (IllegalArgumentException e) {
                    log.warn("Invalid status value: {}", status);
                    throw new IllegalArgumentException("Invalid status value: " + status);
                }
            }
            Page<Ticket> tickets = ticketRepository.findByAssignedAgentIdAndStatusTitleContainingIgnoreCase(
                    clientID, statusEnum, searchQuery, pageable
            );
            log.info("Found {} tickets", tickets.getTotalElements());
            return tickets.map(ticketMapper::toResponse);
        } catch (Exception e) {
            log.error("Error searching tickets: {}", e.getMessage(), e);
            throw new RuntimeException("An unexpected error occurred", e);
        }
    }

    @Override
    @Transactional
    public TicketResponse assignTicketToAgent(Long ticketId, Long agentId) {
        try {
            log.info("Assigning ticket ID: {} to agent ID: {}", ticketId, agentId);

            // Fetch the ticket
            Ticket ticket = ticketRepository.findById(ticketId)
                    .orElseThrow(() -> new ResourceNotFoundException("Ticket not found with ID: " + ticketId));

            // Fetch the agent
            User agent = userRepository.findById(agentId)
                    .orElseThrow(() -> new ResourceNotFoundException("Agent not found with ID: " + agentId));

            // Assign the agent to the ticket
            ticket.setAssignedAgent(agent);

            // Save the updated ticket
            Ticket updatedTicket = ticketRepository.save(ticket);

            // Notify the agent about the assignment
            notificationService.notifyTicketAssigned(updatedTicket, agent.getId());

            log.info("Ticket assigned successfully to agent: {}", agent.getEmail());

            return ticketMapper.toResponse(updatedTicket);
        } catch (Exception e) {
            log.error("Error assigning ticket to agent: {}", e.getMessage(), e);
            throw new RuntimeException("An unexpected error occurred", e);
        }
    }

    @Override
    public Page<TicketResponse> getUnassignedTickets(Pageable pageable) {
        Page<Ticket> tickets = ticketRepository.findByAssignedAgentIsNull(pageable);
        return tickets.map(ticketMapper::toResponse);
    }

    @Override
    public PerformanceMetricsResponse calculatePerformanceMetrics() {
        List<Ticket> allTickets = ticketRepository.findAll();

        int totalTickets = allTickets.size();
        int resolvedTickets = (int) allTickets.stream()
                .filter(ticket -> ticket.getStatus() == Status.RESOLVED)
                .count();
        int unresolvedTickets = (int) allTickets.stream()
                .filter(ticket -> ticket.getStatus() != Status.NOT_RESOLVED)
                .count();
        int newTickets = (int) allTickets.stream()
                .filter(ticket -> ticket.getStatus() == Status.NEW)
                .count();
        int inProgressTickets = (int) allTickets.stream()
                .filter(ticket -> ticket.getStatus() == Status.IN_PROGRESS)
                .count();
        int ticketsAssignedToAgents = (int) allTickets.stream()
                .filter(ticket -> ticket.getAssignedAgent() != null)
                .count();
        int ticketsUnassigned = (int) allTickets.stream()
                .filter(ticket -> ticket.getAssignedAgent() == null)
                .count();

        // Calculate average resolution time (in hours)
        double averageResolutionTime = allTickets.stream()
                .filter(ticket -> ticket.getStatus() == Status.RESOLVED)
                .mapToLong(ticket -> Duration.between(ticket.getCreatedAt(), ticket.getUpdatedAt()).toHours())
                .average()
                .orElse(0);

        return new PerformanceMetricsResponse(
                totalTickets,
                resolvedTickets,
                unresolvedTickets,
                newTickets,
                inProgressTickets,
                averageResolutionTime,
                ticketsAssignedToAgents,
                ticketsUnassigned
        );
    }

    @Override
    public boolean deleteTicketIfNew(Long id) {
        log.info("Attempting to delete ticket with ID: {}", id);

        Ticket ticket = ticketRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Ticket not found with ID: " + id));

        // Check if the ticket status is NEW
        if (ticket.getStatus() == Status.NEW) {
            log.info("Deleting ticket with ID: {} as it has NEW status", id);
            ticketRepository.delete(ticket);
            return true;
        } else {
            log.info("Cannot delete ticket with ID: {} as its status is not NEW but {}", id, ticket.getStatus());
            return false;
        }
    }
}

