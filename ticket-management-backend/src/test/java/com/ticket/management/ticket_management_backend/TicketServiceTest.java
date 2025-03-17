package com.ticket.management.ticket_management_backend;

import com.ticket.management.ticket_management_backend.dto.request.TicketCreateRequest;
import com.ticket.management.ticket_management_backend.dto.response.TicketResponse;
import com.ticket.management.ticket_management_backend.dto.response.UserSummaryResponse;
import com.ticket.management.ticket_management_backend.dto.update.TicketUpdateRequest;
import com.ticket.management.ticket_management_backend.exception.ResourceNotFoundException;
import com.ticket.management.ticket_management_backend.mapper.TicketMapper;
import com.ticket.management.ticket_management_backend.model.Ticket;
import com.ticket.management.ticket_management_backend.model.User;
import com.ticket.management.ticket_management_backend.model.enums.Status;
import com.ticket.management.ticket_management_backend.repository.TicketRepository;
import com.ticket.management.ticket_management_backend.repository.UserRepository;
import com.ticket.management.ticket_management_backend.service.NotificationService;
import com.ticket.management.ticket_management_backend.service.TicketService;
import com.ticket.management.ticket_management_backend.service.impl.TicketServiceImpl;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;

import java.util.Collections;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyLong;
import static org.mockito.Mockito.*;

class TicketServiceTest {

    @Mock
    private TicketRepository ticketRepository;

    @Mock
    private UserRepository userRepository;

    @Mock
    private TicketMapper ticketMapper;

    @Mock
    private NotificationService notificationService;


    private TicketService ticketService;

    private Ticket ticket;
    private User creator;
    private User agent;

    private UserSummaryResponse creatorSummary;
    private UserSummaryResponse agentSummary;
    private TicketCreateRequest createRequest;
    private TicketUpdateRequest updateRequest;
    private TicketResponse ticketResponse;
    private Pageable pageable;

    @BeforeEach
    void setUp() {
        creator = new User();
        creator.setId(1L);
        creator.setFullName("Test Creator");

        agent = new User();
        agent.setId(2L);
        agent.setFullName("Test Agent");

        creatorSummary = new UserSummaryResponse();
        creatorSummary.setId(1L);
        creatorSummary.setFullName("Test Creator");

        agentSummary = new UserSummaryResponse();
        agentSummary.setId(2L);
        agentSummary.setFullName("Test Agent");

        ticket = new Ticket();
        ticket.setId(1L);
        ticket.setTitle("Test Ticket");
        ticket.setDescription("Test Description");
        ticket.setCreator(creator);
        ticket.setAssignedAgent(agent);
        ticket.setStatus(Status.NEW);

        createRequest = new TicketCreateRequest();
        createRequest.setTitle("Test Ticket");
        createRequest.setDescription("Test Description");
        createRequest.setId(2L);

        updateRequest = new TicketUpdateRequest();
        updateRequest.setTitle("Updated Ticket");
        updateRequest.setDescription("Updated Description");
        updateRequest.setAssignedAgentId(2L);
        updateRequest.setStatus(Status.IN_PROGRESS);

        ticketResponse = new TicketResponse();
        ticketResponse.setId(1L);
        ticketResponse.setTitle("Test Ticket");
        ticketResponse.setDescription("Test Description");
        ticketResponse.setCreator(creatorSummary);
        ticketResponse.setAssignedAgent(creatorSummary);
        ticketResponse.setStatus(Status.NEW);

        pageable = Pageable.unpaged();
        MockitoAnnotations.openMocks(this);
        ticketService = new TicketServiceImpl(ticketRepository, notificationService, ticketMapper, userRepository);
    }

    @Test
    void createTicket_Success() {
        // Arrange
        when(ticketMapper.toEntity(any(TicketCreateRequest.class))).thenReturn(ticket);
        when(ticketRepository.save(any(Ticket.class))).thenReturn(ticket);
        when(ticketMapper.toResponse(any(Ticket.class))).thenReturn(ticketResponse);
        doNothing().when(notificationService).notifyNewTicket(any(Ticket.class), anyLong());

        // Act
        TicketResponse result = ticketService.createTicket(createRequest, creator);

        // Assert
        assertNotNull(result);
        assertEquals(ticketResponse, result);
        verify(ticketMapper).toEntity(createRequest);
        verify(ticketRepository).save(ticket);
        verify(ticketMapper).toResponse(ticket);
        verify(notificationService).notifyNewTicket(ticket, creator.getId());
        verify(notificationService).notifyNewTicket(ticket, agent.getId());
    }

    @Test
    void createTicket_WithoutAssignedAgent_Success() {
        // Arrange
        ticket.setAssignedAgent(null);
        when(ticketMapper.toEntity(any(TicketCreateRequest.class))).thenReturn(ticket);
        when(ticketRepository.save(any(Ticket.class))).thenReturn(ticket);
        when(ticketMapper.toResponse(any(Ticket.class))).thenReturn(ticketResponse);
        doNothing().when(notificationService).notifyNewTicket(any(Ticket.class), anyLong());

        // Act
        TicketResponse result = ticketService.createTicket(createRequest, creator);

        // Assert
        assertNotNull(result);
        assertEquals(ticketResponse, result);
        verify(ticketMapper).toEntity(createRequest);
        verify(ticketRepository).save(ticket);
        verify(ticketMapper).toResponse(ticket);
        verify(notificationService).notifyNewTicket(ticket, creator.getId());
        verify(notificationService, never()).notifyNewTicket(ticket, 2L);
    }

    @Test
    void updateTicket_Success() {
        // Arrange
        when(ticketRepository.findById(anyLong())).thenReturn(Optional.of(ticket));
        when(userRepository.findById(anyLong())).thenReturn(Optional.of(agent));
        when(ticketRepository.save(any(Ticket.class))).thenReturn(ticket);
        when(ticketMapper.toResponse(any(Ticket.class))).thenReturn(ticketResponse);
        doNothing().when(ticketMapper).updateTicketFromRequest(any(TicketUpdateRequest.class), any(Ticket.class));
        doNothing().when(notificationService).notifyTicketAssigned(any(Ticket.class), anyLong());

        // Act
        TicketResponse result = ticketService.updateTicket(1L, updateRequest);

        // Assert
        assertNotNull(result);
        assertEquals(ticketResponse, result);
        verify(ticketRepository).findById(1L);
        verify(userRepository).findById(2L);
        verify(ticketMapper).updateTicketFromRequest(updateRequest, ticket);
        verify(ticketRepository).save(ticket);
        verify(ticketMapper).toResponse(ticket);
        verify(notificationService).notifyTicketAssigned(ticket, agent.getId());
    }

    @Test
    void updateTicket_TicketNotFound() {
        // Arrange
        when(ticketRepository.findById(anyLong())).thenReturn(Optional.empty());

        // Act & Assert
        assertThrows(ResourceNotFoundException.class, () -> ticketService.updateTicket(1L, updateRequest));
        verify(ticketRepository).findById(1L);
        verify(ticketMapper, never()).updateTicketFromRequest(any(), any());
        verify(ticketRepository, never()).save(any());
    }

    @Test
    void updateTicket_AssignedAgentNotFound() {
        // Arrange
        when(ticketRepository.findById(anyLong())).thenReturn(Optional.of(ticket));
        when(userRepository.findById(anyLong())).thenReturn(Optional.empty());

        // Act & Assert
        assertThrows(ResourceNotFoundException.class, () -> ticketService.updateTicket(1L, updateRequest));
        verify(ticketRepository).findById(1L);
        verify(userRepository).findById(2L);
        verify(ticketMapper).updateTicketFromRequest(updateRequest, ticket);
        verify(ticketRepository, never()).save(any());
    }

    @Test
    void updateTicket_WithoutAgentId_Success() {
        // Arrange
        updateRequest.setAssignedAgentId(null);
        when(ticketRepository.findById(anyLong())).thenReturn(Optional.of(ticket));
        when(ticketRepository.save(any(Ticket.class))).thenReturn(ticket);
        when(ticketMapper.toResponse(any(Ticket.class))).thenReturn(ticketResponse);
        doNothing().when(ticketMapper).updateTicketFromRequest(any(TicketUpdateRequest.class), any(Ticket.class));

        // Act
        TicketResponse result = ticketService.updateTicket(1L, updateRequest);

        // Assert
        assertNotNull(result);
        assertEquals(ticketResponse, result);
        verify(ticketRepository).findById(1L);
        verify(userRepository, never()).findById(anyLong());
        verify(ticketMapper).updateTicketFromRequest(updateRequest, ticket);
        verify(ticketRepository).save(ticket);
        verify(ticketMapper).toResponse(ticket);
        verify(notificationService, never()).notifyTicketAssigned(any(), anyLong());
    }

    @Test
    void getTickets_Success() {
        // Arrange
        List<Ticket> tickets = Collections.singletonList(ticket);
        Page<Ticket> ticketPage = new PageImpl<>(tickets);
        when(ticketRepository.findAll(any(Pageable.class))).thenReturn(ticketPage);
        when(ticketMapper.toResponse(any(Ticket.class))).thenReturn(ticketResponse);

        // Act
        Page<TicketResponse> result = ticketService.getTickets(pageable);

        // Assert
        assertNotNull(result);
        assertEquals(1, result.getTotalElements());
        assertEquals(ticketResponse, result.getContent().get(0));
        verify(ticketRepository).findAll(pageable);
        verify(ticketMapper).toResponse(ticket);
    }

    @Test
    void getTicketsByAgent_Success() {
        // Arrange
        List<Ticket> tickets = Collections.singletonList(ticket);
        Page<Ticket> ticketPage = new PageImpl<>(tickets);
        when(ticketRepository.findByAssignedAgentId(anyLong(), any(Pageable.class))).thenReturn(ticketPage);
        when(ticketMapper.toResponse(any(Ticket.class))).thenReturn(ticketResponse);

        // Act
        Page<TicketResponse> result = ticketService.getTicketsByAgent(2L, pageable);

        // Assert
        assertNotNull(result);
        assertEquals(1, result.getTotalElements());
        assertEquals(ticketResponse, result.getContent().get(0));
        verify(ticketRepository).findByAssignedAgentId(2L, pageable);
        verify(ticketMapper).toResponse(ticket);
    }

    @Test
    void getTicketsByCreator_Success() {
        // Arrange
        List<Ticket> tickets = Collections.singletonList(ticket);
        Page<Ticket> ticketPage = new PageImpl<>(tickets);
        when(ticketRepository.findByCreatorId(anyLong(), any(Pageable.class))).thenReturn(ticketPage);
        when(ticketMapper.toResponse(any(Ticket.class))).thenReturn(ticketResponse);

        // Act
        Page<TicketResponse> result = ticketService.getTicketsByCreator(1L, pageable);

        // Assert
        assertNotNull(result);
        assertEquals(1, result.getTotalElements());
        assertEquals(ticketResponse, result.getContent().get(0));
        verify(ticketRepository).findByCreatorId(1L, pageable);
        verify(ticketMapper).toResponse(ticket);
    }
}
