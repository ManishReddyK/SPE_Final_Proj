package com.courier.delivery;

import com.courier.delivery.controllers.UserController;
import com.courier.delivery.dao.CourierDetailsDAO;
import com.courier.delivery.dao.UserDAO;
import com.courier.delivery.dto.BasicDTO;
import com.courier.delivery.enums.CourierStatusEnum;
import com.courier.delivery.exceptions.UserNotFoundException;
import com.courier.delivery.models.CourierDetails;
import com.courier.delivery.models.User;
import com.courier.delivery.utils.JWTUtil;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.Mockito.*;

public class UserControllerTest {

    @InjectMocks
    private UserController userController;

    @Mock
    private UserDAO userDAO;

    @Mock
    private CourierDetailsDAO courierDetailsDAO;

    @Mock
    private JWTUtil jwtUtil;

    @BeforeEach
    public void setUp() {
        MockitoAnnotations.openMocks(this);
    }

    @Test
    public void testCreateCourierSuccess() {
        // Mocking data
        String token = "Bearer mockToken";
        CourierDetails courierDetails = new CourierDetails();
        courierDetails.setId(1L);
        courierDetails.setStatus(CourierStatusEnum.PENDING);

        // Mocking behavior
        when(jwtUtil.getUsernameFromToken(token.replace("Bearer ", ""))).thenReturn("test@example.com");
        when(userDAO.findUserByEmail("test@example.com")).thenReturn(Optional.of(new User()));
        when(courierDetailsDAO.save(any())).thenReturn(courierDetails);

        // Call the method
        ResponseEntity<BasicDTO<CourierDetails>> responseEntity = userController.createCourier(courierDetails, token);

        // Assert the result
        assertEquals(HttpStatus.CREATED, responseEntity.getStatusCode());
        assertEquals("Successfully create", responseEntity.getBody().getMessage());
        assertEquals(courierDetails, responseEntity.getBody().getData());
        verify(courierDetailsDAO).save(courierDetails);
    }

    @Test
    public void testCourierCreate_UserNotFound() {
        // Mocking data
        String token = "Bearer mockToken";
        CourierDetails courierDetails = new CourierDetails();
        courierDetails.setId(1L);
        courierDetails.setStatus(CourierStatusEnum.PENDING);

        // Mocking behavior
        when(jwtUtil.getUsernameFromToken(token.replace("Bearer ", ""))).thenReturn("nonexistentuser@example.com");
        when(userDAO.findUserByEmail("nonexistentuser@example.com")).thenReturn(Optional.empty());

        // Call the method and assert the expected exception
        try {
            userController.createCourier(courierDetails, token);
        } catch (UserNotFoundException e) {
            assertEquals("User not found", e.getMessage());
        }
    }



    // Add other test methods as needed

}
