package com.ticket.management.ticket_management_backend;

import com.ticket.management.ticket_management_backend.dto.request.LoginRequest;
import com.ticket.management.ticket_management_backend.dto.request.RegisterRequest;
import com.ticket.management.ticket_management_backend.dto.response.AuthResponse;
import com.ticket.management.ticket_management_backend.exception.ResourceNotFoundException;
import com.ticket.management.ticket_management_backend.model.Role;
import com.ticket.management.ticket_management_backend.model.User;
import com.ticket.management.ticket_management_backend.repository.RoleRepository;
import com.ticket.management.ticket_management_backend.repository.UserRepository;
import com.ticket.management.ticket_management_backend.security.JwtTokenProvider;
import com.ticket.management.ticket_management_backend.service.impl.AuthServiceImpl;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;
import static org.mockito.Mockito.when;

class AuthServiceImplTest {
    @Mock
    private AuthenticationManager authenticationManager;

    @Mock
    private UserRepository userRepository;

    @Mock
    private RoleRepository roleRepository;

    @Mock
    private PasswordEncoder passwordEncoder;

    @Mock
    private JwtTokenProvider tokenProvider;

    @InjectMocks
    private AuthServiceImpl authService;

    private User user;
    private Role role;

    @BeforeEach
    void setUp() {
        role = new Role();
        role.setName("USER");

        user = User.builder()
                .id(1L)
                .email("test@example.com")
                .password("encodedPassword")
                .fullName("John Doe")
                .role(role)
                .isActive(true)
                .build();

        MockitoAnnotations.openMocks(this);

    }

    @Test
    void authenticateUser_Success() {
        LoginRequest loginRequest = new LoginRequest("test@example.com", "password");

        Authentication authentication = mock(Authentication.class);

        when(userRepository.findByEmail(loginRequest.getEmail())).thenReturn(Optional.of(user));
        when(authenticationManager.authenticate(any(UsernamePasswordAuthenticationToken.class))).thenReturn(authentication);
        when(tokenProvider.generateToken(authentication)).thenReturn("mockedToken");

        AuthResponse response = authService.authenticateUser(loginRequest);

        assertNotNull(response);
        assertEquals("mockedToken", response.getToken());
        assertEquals(user.getId(), response.getId());
        assertEquals(user.getEmail(), response.getEmail());
        assertEquals(user.getFullName(), response.getFullName());
        assertEquals(user.getRole().getName(), response.getRole());

        verify(userRepository, times(1)).save(any(User.class));
    }

    @Test
    void authenticateUser_UserBanned_ThrowsException() {
        user.setActive(false);
        LoginRequest loginRequest = new LoginRequest("test@example.com", "password");

        when(userRepository.findByEmail(loginRequest.getEmail())).thenReturn(Optional.of(user));

        Exception exception = assertThrows(IllegalArgumentException.class, () -> authService.authenticateUser(loginRequest));
        assertEquals("Your account has been banned. Please contact support.", exception.getMessage());
    }

    @Test
    void authenticateUser_UserNotFound_ThrowsException() {
        LoginRequest loginRequest = new LoginRequest("test@example.com", "password");

        when(userRepository.findByEmail(loginRequest.getEmail())).thenReturn(Optional.empty());

        assertThrows(ResourceNotFoundException.class, () -> authService.authenticateUser(loginRequest));
    }

    @Test
    void registerUser_Success() {
        RegisterRequest registerRequest = new RegisterRequest("test@example.com", "password", "John Doe", "USER");

        when(userRepository.existsByEmail(registerRequest.getEmail())).thenReturn(false);
        when(roleRepository.findByName(registerRequest.getRole())).thenReturn(Optional.of(role));
        when(passwordEncoder.encode(registerRequest.getPassword())).thenReturn("encodedPassword");
        when(userRepository.save(any(User.class))).thenReturn(user);

        Authentication authentication = mock(Authentication.class);
        when(authenticationManager.authenticate(any(UsernamePasswordAuthenticationToken.class))).thenReturn(authentication);
        when(tokenProvider.generateToken(authentication)).thenReturn("mockedToken");

        AuthResponse response = authService.registerUser(registerRequest);

        assertNotNull(response);
        assertEquals("mockedToken", response.getToken());
        assertEquals(user.getId(), response.getId());
        assertEquals(user.getEmail(), response.getEmail());
        assertEquals(user.getFullName(), response.getFullName());
        assertEquals(user.getRole().getName(), response.getRole());

        verify(userRepository, times(1)).save(any(User.class));
    }

    @Test
    void registerUser_EmailExists_ThrowsException() {
        RegisterRequest registerRequest = new RegisterRequest("test@example.com", "password", "John Doe", "USER");

        when(userRepository.existsByEmail(registerRequest.getEmail())).thenReturn(true);

        Exception exception = assertThrows(IllegalArgumentException.class, () -> authService.registerUser(registerRequest));
        assertEquals("Email already exists", exception.getMessage());
    }

    @Test
    void registerUser_RoleNotFound_ThrowsException() {
        RegisterRequest registerRequest = new RegisterRequest("test@example.com", "password", "John Doe", "ADMIN");

        when(userRepository.existsByEmail(registerRequest.getEmail())).thenReturn(false);
        when(roleRepository.findByName(registerRequest.getRole())).thenReturn(Optional.empty());

        Exception exception = assertThrows(RuntimeException.class, () -> authService.registerUser(registerRequest));
        assertEquals("Role does not exist", exception.getMessage());
    }
}
