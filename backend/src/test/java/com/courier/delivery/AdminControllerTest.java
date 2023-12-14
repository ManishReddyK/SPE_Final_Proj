package com.courier.delivery;
import com.courier.delivery.controllers.AdminController;
import com.courier.delivery.dao.CourierDetailsDAO;
import com.courier.delivery.dao.UserDAO;
import com.courier.delivery.dto.BasicDTO;
import com.courier.delivery.dto.RegisterRequestDTO;
import com.courier.delivery.exceptions.CourierNotFoundException;
import com.courier.delivery.models.CourierDetails;
import com.courier.delivery.services.UserDetailsService;
import com.courier.delivery.utils.JWTUtil;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.Mockito;
import org.mockito.MockitoAnnotations;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

public class AdminControllerTest {

    @InjectMocks
    private AdminController adminController;

    @Mock
    private UserDAO userDAO;

    @Mock
    private CourierDetailsDAO courierDetailsDAO;

    @Mock
    private PasswordEncoder passwordEncoder;

    @Mock
    private UserDetailsService userDetailsService;

    @Mock
    private JWTUtil jwtUtil;

    @BeforeEach
    public void setUp() {
        MockitoAnnotations.openMocks(this);
    }

    @Test
    public void testRegisterAgentSuccess() {
        // Mocking data
        RegisterRequestDTO registerRequestDTO = new RegisterRequestDTO();
        registerRequestDTO.setEmail("test@example.com");
        registerRequestDTO.setPassword("password");
        registerRequestDTO.setConfirmPassword("password");

        // Mocking behavior
        when(userDAO.existsByEmail(registerRequestDTO.getEmail())).thenReturn(false);
        when(passwordEncoder.encode(registerRequestDTO.getPassword())).thenReturn("encodedPassword");
        when(userDetailsService.loadUserByUsername(registerRequestDTO.getEmail())).thenReturn(Mockito.mock(org.springframework.security.core.userdetails.UserDetails.class));
        when(jwtUtil.generateToken(any())).thenReturn("token");

        // Call the method
        ResponseEntity<?> responseEntity = adminController.registerAgent(registerRequestDTO);

        // Assert the result
        assertEquals(HttpStatus.CREATED, responseEntity.getStatusCode());
    }

    @Test
    public void testAgentDeleteSuccess() {
        // Mocking data
        Long agentId = 1L;

        // Mocking behavior
        List<CourierDetails> courierDetailsList = new ArrayList<>();
        when(courierDetailsDAO.findByAgent_Id(agentId)).thenReturn(courierDetailsList);

        // Call the method
        ResponseEntity<BasicDTO<CourierDetails>> responseEntity = adminController.agentDelete(agentId);

        // Assert the result
        assertEquals(HttpStatus.OK, responseEntity.getStatusCode());
        verify(courierDetailsDAO).findByAgent_Id(agentId);
        verify(courierDetailsDAO).saveAll(courierDetailsList);
        verify(userDAO).deleteById(agentId);
    }

    @Test
    public void testAgentDeleteFailureCourierNotFoundException() {
        // Mocking data
        Long agentId = 1L;

        // Mocking behavior
        when(courierDetailsDAO.findByAgent_Id(agentId)).thenReturn(new ArrayList<>());

        // Call the method and assert the expected exception
        try {
            adminController.agentDelete(agentId);
        } catch (CourierNotFoundException e) {
            assertEquals("Courier not found for agent with ID: " + agentId, e.getMessage());
        }
    }
    // Add other test methods as needed
    @Test
    public void testCourierDeleteSuccess() {
        // Mocking data
        Long orderId = 1L;

        // Mocking behavior
        when(courierDetailsDAO.findById(orderId)).thenReturn(Optional.of(new CourierDetails()));

        // Call the method
        ResponseEntity<BasicDTO<CourierDetails>> responseEntity = adminController.courierDelete(orderId);

        // Assert the result
        assertEquals(HttpStatus.OK, responseEntity.getStatusCode());
        verify(courierDetailsDAO).deleteById(orderId);
    }

    @Test
    public void testCourierDeleteFailureCourierNotFoundException() {
        // Mocking data
        Long orderId = 1L;

        // Mocking behavior
        when(courierDetailsDAO.findById(orderId)).thenReturn(Optional.empty());

        // Call the method and assert the expected exception
        try {
            adminController.courierDelete(orderId);
        } catch (CourierNotFoundException e) {
            assertEquals("Courier not found", e.getMessage());
        }
    }
}
