package com.ticket.management.ticket_management_backend.mapper;

import com.ticket.management.ticket_management_backend.dto.request.TicketCreateRequest;
import com.ticket.management.ticket_management_backend.dto.response.TicketResponse;
import com.ticket.management.ticket_management_backend.dto.update.TicketUpdateRequest;
import com.ticket.management.ticket_management_backend.model.Ticket;
import org.mapstruct.*;

@Mapper(componentModel = "spring" , uses = {UserMapper.class , CommentMapper.class})
public interface TicketMapper {
    @Mapping(target = "id", ignore = true)
    @Mapping(target = "creator", ignore = true)
    @Mapping(target = "assignedAgent", ignore = true)
    @Mapping(target = "comments", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "updatedAt", ignore = true)
    @Mapping(target = "resolvedAt", ignore = true)
    @Mapping(target = "status", constant = "NEW")
    Ticket toEntity(TicketCreateRequest ticketCreateRequest);

    TicketResponse toResponse(Ticket ticket);

    @BeanMapping(nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE)
    void updateTicketFromRequest(TicketUpdateRequest ticketUpdateRequest, @MappingTarget Ticket ticket);
}
