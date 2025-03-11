package com.ticket.management.ticket_management_backend.controller;


import com.ticket.management.ticket_management_backend.dto.response.TicketResponse;
import com.ticket.management.ticket_management_backend.dto.response.UserSummaryResponse;
import com.ticket.management.ticket_management_backend.dto.update.UpdateUserStatusRequest;
import com.ticket.management.ticket_management_backend.model.User;
import com.ticket.management.ticket_management_backend.security.UserPrincipal;
import com.ticket.management.ticket_management_backend.service.TicketService;
import com.ticket.management.ticket_management_backend.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin")
@PreAuthorize("hasRole('ADMIN')")
@RequiredArgsConstructor
public class AdminController {

    private final TicketService ticketService;
    private final UserService userService;

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

    /**
     * Get all users (both AGENT and CLIENT roles)
     * @return List of all users
     */
    @GetMapping("/users")
    public ResponseEntity<List<UserSummaryResponse>> getAllUsers() {
        return ResponseEntity.ok(userService.getAllUsers());
    }

    @GetMapping("/users/agents")
    public ResponseEntity<List<UserSummaryResponse>> getAllAgents() {
        return ResponseEntity.ok(userService.getAllAgents());
    }

    /**
     * Update the status of a user
     * @param userId ID of the user
     * @param isActive New status of the user
     * @return Updated user
     */
    @PatchMapping("/{userId}/status")
    public ResponseEntity<UserSummaryResponse> updateUserStatus(
            @PathVariable Long userId,
            @RequestBody UpdateUserStatusRequest request) {
        return ResponseEntity.ok(userService.updateUserStatus(userId, request));
    }

    @GetMapping("/tickets/unassigned")
    public ResponseEntity<Page<TicketResponse>> getUnassignedTickets(Pageable pageable) {
        return ResponseEntity.ok(ticketService.getUnassignedTickets(pageable));
    }

}
