package com.ticket.management.ticket_management_backend.controller;


import com.ticket.management.ticket_management_backend.dto.request.TicketCreateRequest;
import com.ticket.management.ticket_management_backend.dto.response.TicketResponse;
import com.ticket.management.ticket_management_backend.dto.update.TicketStatusUpdateRequest;
import com.ticket.management.ticket_management_backend.dto.update.TicketUpdateRequest;
import com.ticket.management.ticket_management_backend.exception.ResourceNotFoundException;
import com.ticket.management.ticket_management_backend.model.User;
import com.ticket.management.ticket_management_backend.security.UserPrincipal;
import com.ticket.management.ticket_management_backend.service.TicketService;
import com.ticket.management.ticket_management_backend.service.UserService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/user/tickets")
@PreAuthorize("hasRole('CLIENT')")
@RequiredArgsConstructor
@Slf4j
public class TicketController {
    private final TicketService ticketService;
    private final UserService userService;


    @PostMapping
    public ResponseEntity<?> createTicket(
            @Valid @RequestBody TicketCreateRequest request,
            @AuthenticationPrincipal UserPrincipal userPrincipal) {
        try {
            log.info("User ID: " + userPrincipal.getId());
            User creator = userService.findById(userPrincipal.getId());
            return ResponseEntity.ok(ticketService.createTicket(request, creator));
        } catch (Exception e) {
            return ResponseEntity.status(500).body(Map.of(
                    "error", "Ticket creation failed",
                    "message", e.getMessage()
            ));
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<TicketResponse> updateTicket(
            @PathVariable Long id,
            @Valid @RequestBody TicketUpdateRequest request) {
        return ResponseEntity.ok(ticketService.updateTicket(id, request));
    }

    @GetMapping("/my-tickets")
    public ResponseEntity<Page<TicketResponse>> getMyTickets(
            @AuthenticationPrincipal UserPrincipal userPrincipal,
            Pageable pageable) {
        return ResponseEntity.ok(ticketService.getTicketsByCreator(userPrincipal.getId(), pageable));
    }

    @GetMapping("/search")
    public ResponseEntity<Page<TicketResponse>> searchTicketsByClient(
            @AuthenticationPrincipal UserPrincipal userPrincipal,
            @RequestParam(required = false) String status,
            @RequestParam(required = false) String searchQuery,
            Pageable pageable) {
        return ResponseEntity.ok(ticketService.searchTicketsByClient(
                userPrincipal.getId(), status, searchQuery, pageable));
    }

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

    // Finally, add the endpoint to the TicketController
    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteTicket(@PathVariable Long id,
                                          @AuthenticationPrincipal UserPrincipal userPrincipal) {
        try {
            log.info("Delete request for ticket ID: {} by user ID: {}", id, userPrincipal.getId());

            // Verify the ticket belongs to the current user
            TicketResponse ticket = ticketService.getTicketById(id);
            if (!ticket.getCreator().getId().equals(userPrincipal.getId())) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN)
                        .body(Map.of("error", "You can only delete your own tickets"));
            }

            boolean deleted = ticketService.deleteTicketIfNew(id);

            if (deleted) {
                return ResponseEntity.ok(Map.of(
                        "success", true,
                        "message", "Ticket deleted successfully"
                ));
            } else {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                        .body(Map.of(
                                "success", false,
                                "message", "Ticket could not be deleted because it is not in NEW status"
                        ));
            }
        } catch (ResourceNotFoundException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of("error", e.getMessage()));
        } catch (Exception e) {
            log.error("Error deleting ticket: {}", e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "An unexpected error occurred: " + e.getMessage()));
        }
    }
}
