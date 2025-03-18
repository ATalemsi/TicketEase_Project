package com.ticket.management.ticket_management_backend.dto.response;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class PerformanceMetricsResponse {
    private int totalTickets;
    private int resolvedTickets;
    private int unresolvedTickets;
    private int newTickets;
    private int inProgressTickets;
    private double averageResolutionTime; // in hours
    private int ticketsAssignedToAgents;
    private int ticketsUnassigned;
}
