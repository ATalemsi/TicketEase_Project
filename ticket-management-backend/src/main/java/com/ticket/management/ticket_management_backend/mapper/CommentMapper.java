package com.ticket.management.ticket_management_backend.mapper;

import com.ticket.management.ticket_management_backend.dto.response.CommentResponse;
import com.ticket.management.ticket_management_backend.model.Comment;
import org.mapstruct.Mapper;
import org.mapstruct.factory.Mappers;

@Mapper(componentModel = "spring" , uses = {UserMapper.class})
public interface CommentMapper {
    CommentMapper INSTANCE = Mappers.getMapper(CommentMapper.class);
    CommentResponse toResponse(Comment comment);
}
