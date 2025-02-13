package com.ticket.management.ticket_management_backend.service;

import com.ticket.management.ticket_management_backend.dto.request.LoginRequest;
import com.ticket.management.ticket_management_backend.dto.request.RegisterRequest;
import com.ticket.management.ticket_management_backend.dto.response.AuthResponse;

public interface AuthService {
    AuthResponse authenticateUser(LoginRequest loginRequest);
    AuthResponse registerUser(RegisterRequest registerRequest);
}
