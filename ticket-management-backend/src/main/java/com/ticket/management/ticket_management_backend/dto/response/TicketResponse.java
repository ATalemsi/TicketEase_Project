package com.ticket.management.ticket_management_backend.dto.response;

import com.ticket.management.ticket_management_backend.model.enums.Priority;
import com.ticket.management.ticket_management_backend.model.enums.Status;
import lombok.Data;

import java.time.LocalDateTime;
import java.util.List;

@Data
public class TicketResponse {
    private Long id;
    private String title;
    private String description;
    private Priority priority;
    private Status status;
    private UserSummaryResponse creator;
    private UserSummaryResponse assignedAgent;
    private List<CommentResponse> comments;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private LocalDateTime resolvedAt;
}
