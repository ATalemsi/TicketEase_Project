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

        log.info("Contenu de la notification: {}", notification);

        String userDestination = "/user/" + userId.toString() + "/queue/tickets";
        log.info("Envoi direct à la destination {}", userDestination);
        messagingTemplate.convertAndSend("/topic/tickets/" + userId, notification);

        log.info("Notifications envoyées");
    }

    @Override
    public void notifyTicketAssigned(Ticket ticket , Long userId) {
        NotificationMessage notification =new NotificationMessage("You have been assigned to ticket: " + ticket.getTitle());

        String userDestination = "/user/" + userId.toString() + "/queue/tickets";
        log.info("Envoi direct à la destination assigned {}", userDestination);
        messagingTemplate.convertAndSend("/topic/assigned/" + userId, notification);
    }

    @Override
    public void notifyTicketUpdate(Ticket ticket ,Long userId) {
        messagingTemplate.convertAndSend(
                "/topic/tickets/" + userId,
                new NotificationMessage("Ticket updated status: " + ticket.getTitle())
        );
    }

    @Override
    public void notifyTicketAddComment(Ticket ticket ,Long userId) {
        messagingTemplate.convertAndSend(
                "/topic/tickets/" + userId,
                new NotificationMessage("Ticket Add Comment: " + ticket.getTitle())
        );
    }
}
