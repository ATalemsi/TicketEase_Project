package com.ticket.management.ticket_management_backend.service;

import com.ticket.management.ticket_management_backend.dto.response.UserSummaryResponse;
import com.ticket.management.ticket_management_backend.dto.update.UpdateUserStatusRequest;
import com.ticket.management.ticket_management_backend.model.User;

import java.util.List;

public interface UserService {
    User findById(Long id);
    UserSummaryResponse getUserSummary(Long id);
    List<UserSummaryResponse> getAllAgents();
    boolean existsByEmail(String email);
    List<UserSummaryResponse> getAllUsers();
    UserSummaryResponse updateUserStatus(Long userId, UpdateUserStatusRequest request);
}
