package com.ticket.management.ticket_management_backend.controller;


import com.ticket.management.ticket_management_backend.dto.response.TicketResponse;
import com.ticket.management.ticket_management_backend.service.TicketService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

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
}
