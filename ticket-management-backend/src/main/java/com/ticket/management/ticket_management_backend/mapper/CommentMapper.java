package com.ticket.management.ticket_management_backend.mapper;

import com.ticket.management.ticket_management_backend.dto.request.CommentRequest;
import com.ticket.management.ticket_management_backend.dto.response.CommentResponse;
import com.ticket.management.ticket_management_backend.model.Comment;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.factory.Mappers;

@Mapper(componentModel = "spring" , uses = {UserMapper.class})
public interface CommentMapper {
    @Mapping(target = "createdAt", ignore = true) // Ignore unmapped field
    Comment toEntity(CommentRequest commentRequest);

    @Mapping(source = "author", target = "author") // Map User to UserSummaryResponse using UserMapper
    @Mapping(source = "content", target = "content")
    @Mapping(source = "createdAt", target = "creationDate") // Match CommentResponse field name
    CommentResponse toResponse(Comment comment);
}
