package com.ticket.management.ticket_management_backend.repository;

import com.ticket.management.ticket_management_backend.model.Comment;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

public interface CommentRepository extends JpaRepository<Comment, Long> {
    Page<Comment> findByTicketId(Long ticketId , Pageable pageable);
    void deleteByTicketId(Long ticketId);
}
