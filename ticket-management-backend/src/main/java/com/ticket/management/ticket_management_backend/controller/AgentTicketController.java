package com.ticket.management.ticket_management_backend.controller;


import com.ticket.management.ticket_management_backend.dto.response.TicketResponse;
import com.ticket.management.ticket_management_backend.dto.update.TicketStatusUpdateRequest;
import com.ticket.management.ticket_management_backend.exception.ResourceNotFoundException;
import com.ticket.management.ticket_management_backend.security.UserPrincipal;
import com.ticket.management.ticket_management_backend.service.TicketService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/agent/tickets")
@PreAuthorize("hasRole('AGENT')")
@RequiredArgsConstructor
public class AgentTicketController {

    private static final Logger log = LoggerFactory.getLogger(AgentTicketController.class);
    private final TicketService ticketService;


    @GetMapping("/{ticketId}")
    public ResponseEntity<TicketResponse> getTicketById(@PathVariable Long ticketId) {
        log.info("Fetching ticket with ID: {}", ticketId);
        TicketResponse ticket = ticketService.getTicketById(ticketId);
        return ResponseEntity.ok(ticket);
    }

    // Get all tickets assigned to the AGENT
    @GetMapping("/assigned")
    public ResponseEntity<Page<TicketResponse>> getAssignedTickets(
            @AuthenticationPrincipal UserPrincipal userPrincipal,
            Pageable pageable) {
        return ResponseEntity.ok(ticketService.getTicketsByAgent(userPrincipal.getId(), pageable));
    }

    // Update the status of a ticket
    @PutMapping("/{id}/status")
    public ResponseEntity<?> updateTicketStatus(
            @PathVariable Long id,
            @Valid @RequestBody TicketStatusUpdateRequest request) {
        try {
            return ResponseEntity.ok(ticketService.updateTicketStatus(id, request));
        } catch (ResourceNotFoundException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("error", e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(Map.of("error", e.getMessage()));
        }
    }

    // Add a comment to a ticket
    @PostMapping("/{id}/comments")
    public ResponseEntity<TicketResponse> addComment(
            @PathVariable Long id,
            @RequestParam String comment,
            @AuthenticationPrincipal UserPrincipal userPrincipal) {
        return ResponseEntity.ok(ticketService.addComment(id, comment, userPrincipal.getId()));
    }

    // Search and filter tickets assigned to the AGENT
    @GetMapping("/search")
    public ResponseEntity<Page<TicketResponse>> searchTickets(
            @AuthenticationPrincipal UserPrincipal userPrincipal,
            @RequestParam(required = false) String status,
            @RequestParam(required = false) String priority,
            @RequestParam(required = false) String searchQuery,
            Pageable pageable) {
        return ResponseEntity.ok(ticketService.searchTicketsByAgent(
                userPrincipal.getId(), status, priority, searchQuery, pageable));
    }
}
