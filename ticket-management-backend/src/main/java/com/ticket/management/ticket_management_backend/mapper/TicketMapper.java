package com.ticket.management.ticket_management_backend.mapper;

import com.ticket.management.ticket_management_backend.dto.request.TicketCreateRequest;
import com.ticket.management.ticket_management_backend.dto.response.TicketResponse;
import com.ticket.management.ticket_management_backend.dto.update.TicketUpdateRequest;
import com.ticket.management.ticket_management_backend.model.Ticket;
import org.mapstruct.*;

@Mapper(componentModel = "spring" , uses = {UserMapper.class , CommentMapper.class} , unmappedTargetPolicy = ReportingPolicy.IGNORE )
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

    // Explicitly map fields, including comments to responses
    @Mapping(source = "id", target = "id")
    @Mapping(source = "title", target = "title")
    @Mapping(source = "description", target = "description")
    @Mapping(source = "status", target = "status")
    @Mapping(source = "priority", target = "priority") // Assuming status is an enum, MapStruct will call toString()// Assuming status is an enum, MapStruct will call toString()
    @Mapping(source = "comments", target = "comments") // Map comments to responses using CommentMapper
    TicketResponse toResponse(Ticket ticket);

    @BeanMapping(nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE)
    void updateTicketFromRequest(TicketUpdateRequest ticketUpdateRequest, @MappingTarget Ticket ticket);
}
