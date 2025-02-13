package com.ticket.management.ticket_management_backend.repository;

import com.ticket.management.ticket_management_backend.model.Ticket;
import com.ticket.management.ticket_management_backend.model.enums.Status;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;

public interface TicketRepository extends JpaRepository<Ticket, Long> {
    Page<Ticket> findByCreatorId(Long creatorId, Pageable pageable);
    Page<Ticket> findByAssignedAgentId(Long agentId, Pageable pageable);
    Page<Ticket> findByStatus(Status status, Pageable pageable);

    @Query("SELECT t FROM Ticket t WHERE t.status = 'NEW' OR t.status = 'IN_PROGRESS'")
    List<Ticket> findActiveTickets();

    @Query("SELECT COUNT(t) FROM Ticket t WHERE t.assignedAgent.id = ?1 AND (t.status = 'NEW' OR t.status = 'IN_PROGRESS')")
    Long countActiveTicketsByAgent(Long agentId);
}

