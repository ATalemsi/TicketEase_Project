package com.ticket.management.ticket_management_backend.dto.update;

import com.ticket.management.ticket_management_backend.model.enums.Priority;
import com.ticket.management.ticket_management_backend.model.enums.Status;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class TicketUpdateRequest {

    private String title;

    @Size(min = 10, max = 1000)
    private String description;

    private Priority priority;
    private Status status;
    private Long assignedAgentId;
}
