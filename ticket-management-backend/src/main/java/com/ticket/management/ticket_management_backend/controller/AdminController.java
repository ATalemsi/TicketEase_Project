package com.ticket.management.ticket_management_backend.controller;


import com.ticket.management.ticket_management_backend.dto.response.TicketResponse;
import com.ticket.management.ticket_management_backend.security.UserPrincipal;
import com.ticket.management.ticket_management_backend.service.TicketService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/admin")
@PreAuthorize("hasRole('ADMIN')")
@RequiredArgsConstructor
public class AdminController {

    private final TicketService ticketService;

    @GetMapping("/tickets")
    public ResponseEntity<Page<TicketResponse>> getAllTickets(Pageable pageable) {
        return ResponseEntity.ok(ticketService.getTickets(pageable));
    }

    @GetMapping("/tickets/agent/{agentId}")
    public ResponseEntity<Page<TicketResponse>> getTicketsByAgent(
            @PathVariable Long agentId,
            Pageable pageable) {
        return ResponseEntity.ok(ticketService.getTicketsByAgent(agentId, pageable));
    }
    @GetMapping("/assigned")
    public ResponseEntity<Page<TicketResponse>> getAssignedTickets(
            @AuthenticationPrincipal UserPrincipal userPrincipal,
            Pageable pageable) {
        return ResponseEntity.ok(ticketService.getTicketsByAgent(userPrincipal.getId(), pageable));
    }
    @PostMapping("/tickets/{ticketId}/assign/{agentId}")
    public ResponseEntity<TicketResponse> assignTicketToAgent(
            @PathVariable Long ticketId,
            @PathVariable Long agentId) {
        return ResponseEntity.ok(ticketService.assignTicketToAgent(ticketId, agentId));
    }
}
