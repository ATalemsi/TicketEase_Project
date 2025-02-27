package com.ticket.management.ticket_management_backend.controller;

import com.ticket.management.ticket_management_backend.dto.request.LoginRequest;
import com.ticket.management.ticket_management_backend.dto.request.RegisterRequest;
import com.ticket.management.ticket_management_backend.dto.response.AuthResponse;
import com.ticket.management.ticket_management_backend.service.AuthService;
import com.ticket.management.ticket_management_backend.service.impl.TokenBlacklistService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;

    private final TokenBlacklistService tokenBlacklistService;

    @PostMapping("/login")
    public ResponseEntity<AuthResponse> loginUser(@RequestBody LoginRequest loginRequest) {
        AuthResponse authResponse = authService.authenticateUser(loginRequest);
        return ResponseEntity.ok(authResponse);
    }

    @PostMapping("/register")
    public ResponseEntity<AuthResponse> registerUser(@RequestBody RegisterRequest registerRequest) {
        AuthResponse authResponse = authService.registerUser(registerRequest);
        return ResponseEntity.ok(authResponse);

    }

    @PostMapping("/logout")
    public ResponseEntity<?> logout(@RequestHeader("Authorization") String authorization) {
        String token = authorization.replace("Bearer ", "");
        tokenBlacklistService.blacklistToken(token);

        return ResponseEntity.status(HttpStatus.NO_CONTENT).build();
    }
}
