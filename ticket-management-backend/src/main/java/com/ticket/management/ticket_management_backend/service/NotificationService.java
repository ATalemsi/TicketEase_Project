package com.ticket.management.ticket_management_backend.service;


import com.ticket.management.ticket_management_backend.model.Ticket;

public interface NotificationService {
    void notifyNewTicket(Ticket ticket);
    public void notifyTicketAssigned(Ticket ticket);
    public void notifyTicketUpdate(Ticket ticket);
}
