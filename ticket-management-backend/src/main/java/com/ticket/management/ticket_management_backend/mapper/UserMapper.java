package com.ticket.management.ticket_management_backend.mapper;

import com.ticket.management.ticket_management_backend.dto.response.UserSummaryResponse;
import com.ticket.management.ticket_management_backend.model.User;
import org.mapstruct.Mapper;


@Mapper(componentModel = "spring")
public interface UserMapper {
    UserSummaryResponse toResponseDto(User user);
}
