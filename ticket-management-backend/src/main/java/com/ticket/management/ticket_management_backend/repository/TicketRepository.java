package com.ticket.management.ticket_management_backend.repository;

import com.ticket.management.ticket_management_backend.model.Ticket;
import com.ticket.management.ticket_management_backend.model.enums.Priority;
import com.ticket.management.ticket_management_backend.model.enums.Status;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface TicketRepository extends JpaRepository<Ticket, Long> {
    Page<Ticket> findByCreatorId(Long creatorId, Pageable pageable);
    Page<Ticket> findByAssignedAgentId(Long agentId, Pageable pageable);
    Page<Ticket> findByStatus(Status status, Pageable pageable);

    @Query("SELECT t FROM Ticket t WHERE t.status = 'NEW' OR t.status = 'IN_PROGRESS'")
    List<Ticket> findActiveTickets();

    @Query("SELECT COUNT(t) FROM Ticket t WHERE t.assignedAgent.id = ?1 AND (t.status = 'NEW' OR t.status = 'IN_PROGRESS')")
    Long countActiveTicketsByAgent(Long agentId);


    @Query("SELECT t FROM Ticket t WHERE " +
            "t.assignedAgent.id = :agentId AND " +
            "(:status IS NULL OR t.status = :statusEnum) AND " +
            "(:priority IS NULL OR t.priority = :priorityEnum) AND " +
            "(COALESCE(:searchQuery, '') = '' OR LOWER(t.title) LIKE LOWER(CONCAT('%', :searchQuery, '%')))")
    Page<Ticket> findByAssignedAgentIdAndStatusAndPriorityAndTitleContainingIgnoreCase(
            @Param("agentId") Long agentId,
            @Param("status") String status,
            @Param("statusEnum") Status statusEnum,
            @Param("priority") String priority,
            @Param("priorityEnum") Priority priorityEnum,
            @Param("searchQuery") String searchQuery,
            Pageable pageable);

    @Query("SELECT t FROM Ticket t WHERE " +
            "t.creator.id = :creatorId AND " +
            "(:statusEnum IS NULL OR t.status = :statusEnum) AND " +
            "(COALESCE(:searchQuery, '') = '' OR LOWER(t.title) LIKE LOWER(CONCAT('%', :searchQuery, '%')))")
    Page<Ticket> findByAssignedAgentIdAndStatusTitleContainingIgnoreCase(
            @Param("creatorId") Long creatorId,
            @Param("statusEnum") Status statusEnum,
            @Param("searchQuery") String searchQuery,
            Pageable pageable
    );

}

