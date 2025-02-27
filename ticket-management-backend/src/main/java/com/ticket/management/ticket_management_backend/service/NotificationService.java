package com.ticket.management.ticket_management_backend.service;


import com.ticket.management.ticket_management_backend.model.Ticket;

public interface NotificationService {
    void notifyNewTicket(Ticket ticket, Long userId);
     void notifyTicketAssigned(Ticket ticket);
     void notifyTicketUpdate(Ticket ticket);

}
