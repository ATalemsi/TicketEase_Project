package com.ticket.management.ticket_management_backend.service.impl;


import com.ticket.management.ticket_management_backend.model.NotificationMessage;
import com.ticket.management.ticket_management_backend.model.Ticket;
import com.ticket.management.ticket_management_backend.service.NotificationService;
import lombok.RequiredArgsConstructor;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class NotificationServiceImpl implements NotificationService {
    private final SimpMessagingTemplate messagingTemplate;

    @Override
    public void notifyNewTicket(Ticket ticket) {
        messagingTemplate.convertAndSend("/topic/tickets",
                new NotificationMessage("New ticket created: " + ticket.getTitle()));
    }

    @Override
    public void notifyTicketAssigned(Ticket ticket) {
        messagingTemplate.convertAndSendToUser(
                ticket.getAssignedAgent().getId().toString(),
                "/queue/notifications",
                new NotificationMessage("You have been assigned to ticket: " + ticket.getTitle())
        );
    }

    @Override
    public void notifyTicketUpdate(Ticket ticket) {
        messagingTemplate.convertAndSend(
                "/topic/tickets/" + ticket.getId(),
                new NotificationMessage("Ticket updated: " + ticket.getTitle())
        );

    }
}
