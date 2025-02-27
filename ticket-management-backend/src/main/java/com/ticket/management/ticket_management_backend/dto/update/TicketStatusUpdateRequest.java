package com.ticket.management.ticket_management_backend.dto.update;

import com.ticket.management.ticket_management_backend.model.enums.Status;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class TicketStatusUpdateRequest {

    @NotNull(message = "Status is required")
    private Status status;
}
