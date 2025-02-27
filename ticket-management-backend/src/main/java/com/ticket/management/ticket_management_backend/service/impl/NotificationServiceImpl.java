package com.ticket.management.ticket_management_backend.service.impl;


import com.fasterxml.jackson.databind.ObjectMapper;
import com.ticket.management.ticket_management_backend.model.NotificationMessage;
import com.ticket.management.ticket_management_backend.model.Ticket;
import com.ticket.management.ticket_management_backend.service.NotificationService;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class NotificationServiceImpl implements NotificationService {
    private static final Logger log = LoggerFactory.getLogger(NotificationServiceImpl.class);
    private final SimpMessagingTemplate messagingTemplate;

    @Override
    public void notifyNewTicket(Ticket ticket, Long userId) {
        NotificationMessage notification = new NotificationMessage("New ticket created: " + ticket.getTitle());
        String destination = "/user/" + userId.toString() + "/queue/tickets";

        try {
            ObjectMapper mapper = new ObjectMapper();
            String jsonMessage = mapper.writeValueAsString(notification);
            log.info("Sending notification JSON: {}", jsonMessage);
        } catch (Exception e) {
            log.error("Error serializing notification", e);
        }

        log.info("Sending notification to destination {}: {}", destination, notification.getMessage());
        messagingTemplate.convertAndSendToUser(userId.toString(), "/queue/tickets", notification);
        log.info("Notification sent to user {}", userId);
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
