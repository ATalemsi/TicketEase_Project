package com.ticket.management.ticket_management_backend.service.impl;

import com.ticket.management.ticket_management_backend.dto.response.UserSummaryResponse;
import com.ticket.management.ticket_management_backend.dto.update.UpdateUserStatusRequest;
import com.ticket.management.ticket_management_backend.exception.ResourceNotFoundException;
import com.ticket.management.ticket_management_backend.mapper.UserMapper;
import com.ticket.management.ticket_management_backend.model.User;
import com.ticket.management.ticket_management_backend.repository.UserRepository;
import com.ticket.management.ticket_management_backend.service.UserService;
import lombok.AllArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@AllArgsConstructor
public class UserServiceImpl  implements UserService {
    private final UserMapper userMapper;
    private final UserRepository userRepository;

    @Override
    @Transactional(readOnly = true)
    public User findById(Long id) {
        return userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + id));
    }
    @Transactional(readOnly = true)
    public UserSummaryResponse getUserSummary(Long id) {
        return userMapper.toResponseDto(findById(id));
    }

    @Transactional(readOnly = true)
    public List<UserSummaryResponse> getAllAgents() {
        return userRepository.findAll().stream()
                .filter(user -> "AGENT".equals(user.getRole().getName()))
                .map(userMapper::toResponseDto)
                .toList();
    }

    @Transactional(readOnly = true)
    public List<UserSummaryResponse> getAllUsers() {
        return userRepository.findAll().stream()
                .filter(user -> "CLIENT".equals(user.getRole().getName()) ||
                        "AGENT".equals(user.getRole().getName()))
                .map(userMapper::toResponseDto)
                .toList();
    }

    @Override
    public UserSummaryResponse updateUserStatus(Long userId, UpdateUserStatusRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + userId));

        user.setActive(request.isActive());
        User savedUser = userRepository.save(user);

        return userMapper.toResponseDto(savedUser);
    }


    @Transactional(readOnly = true)
    public boolean existsByEmail(String email) {
        return userRepository.existsByEmail(email);
    }
}
