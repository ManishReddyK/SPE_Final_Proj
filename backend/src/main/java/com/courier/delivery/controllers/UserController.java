package com.courier.delivery.controllers;

import com.courier.delivery.dao.CourierDetailsDAO;
import com.courier.delivery.dao.UserDAO;
import com.courier.delivery.dto.BasicDTO;
import com.courier.delivery.dto.RateCalculateReqDTO;
import com.courier.delivery.dto.RegisterRequestDTO;
import com.courier.delivery.enums.CourierStatusEnum;
import com.courier.delivery.enums.UserRoleEnum;
import com.courier.delivery.exceptions.CourierNotFoundException;
import com.courier.delivery.exceptions.UserNotFoundException;
import com.courier.delivery.models.CourierDetails;
import com.courier.delivery.models.User;
import com.courier.delivery.utils.CalculationUtil;
import com.courier.delivery.utils.JWTUtil;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

// import org.slf4j.Logger;
// import org.slf4j.LoggerFactory;

import org.apache.logging.log4j.LogManager;
import org.apache.logging.log4j.Logger;

@RestController
@CrossOrigin
@RequestMapping("/user")
public class UserController {
    @Autowired
    UserDAO userDAO;
    @Autowired
    CourierDetailsDAO courierDetailsDAO;
    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private JWTUtil jwtUtil;

    // private Logger logger = LogManager.getLogger(UserController.class);
    private static final Logger logger = LogManager.getLogger(UserController.class);

    @Operation(security = @SecurityRequirement(name = "bearerAuth"))
    @PostMapping("/courier/create")
    public ResponseEntity<BasicDTO<CourierDetails>> createCourier(@RequestBody CourierDetails r, @RequestHeader(HttpHeaders.AUTHORIZATION) String token) {
        logger.info("[TYPE] incoming [METHOD] POST [API_NAME] createCourier");
        String userEmail = jwtUtil.getUsernameFromToken(token.replace("Bearer ", ""));
        Optional<User> us = userDAO.findUserByEmail(userEmail);
        if (us.isEmpty()) {
            logger.error("[TYPE] error [API_NAME] createCourier [ERROR] User not found");
            throw new UserNotFoundException();
        }
    
        r.setCreatedOn(LocalDate.now());
        r.setStatus(CourierStatusEnum.PENDING);
        r.setId(null);
        r.setUser(us.get());
        r.setAgent(null);
        r.setExpectedDeliveryDate(LocalDate.now().plusDays(5));
        courierDetailsDAO.save(r);
    
        logger.info("[TYPE] outgoing [METHOD] POST [API_NAME] createCourier [STATUS] SUCCESS");
        return new ResponseEntity<>(new BasicDTO<>(true, "Successfully create", r), HttpStatus.CREATED);
    }
    
    @Operation(security = @SecurityRequirement(name = "bearerAuth"))
    @GetMapping("/courier/trackById/{id}")
    public ResponseEntity<BasicDTO<CourierDetails>> courierTrackById(@PathVariable("id") Long id) {
        logger.info("[TYPE] incoming [METHOD] GET [API_NAME] courierTrackById");
        Optional<CourierDetails> courierDetailsOptional = courierDetailsDAO.findById(id);
        if (courierDetailsOptional.isEmpty()) {
            logger.error("[TYPE] error [API_NAME] courierTrackById [ERROR] Courier not found for id: {}", id);
            throw new CourierNotFoundException();
        }
    
        logger.info("[TYPE] outgoing [METHOD] GET [API_NAME] courierTrackById [STATUS] SUCCESS");
        return new ResponseEntity<>(new BasicDTO<>(true, "Order details", courierDetailsOptional.get()), HttpStatus.OK);
    }
    
    @Operation(security = @SecurityRequirement(name = "bearerAuth"))
    @GetMapping("/courier/myOrders")
    public ResponseEntity<BasicDTO<List<CourierDetails>>> courierMyOrders(@RequestHeader(HttpHeaders.AUTHORIZATION) String token) {
        logger.info("[TYPE] incoming [METHOD] GET [API_NAME] courierMyOrders");
        String userEmail = jwtUtil.getUsernameFromToken(token.replace("Bearer ", ""));
        Optional<User> us = userDAO.findUserByEmail(userEmail);
        if (us.isEmpty()) {
            logger.error("[TYPE] error [API_NAME] courierMyOrders [ERROR] User not found");
            throw new UserNotFoundException();
        }
    
        List<CourierDetails> courierDetailsOptional = courierDetailsDAO.findByUser(us.get());
    
        logger.info("[TYPE] outgoing [METHOD] GET [API_NAME] courierMyOrders [STATUS] SUCCESS");
        return new ResponseEntity<>(new BasicDTO<>(true, "Orders List", courierDetailsOptional), HttpStatus.OK);
    }
    
    @Operation(security = @SecurityRequirement(name = "bearerAuth"))
    @GetMapping("/profile")
    public ResponseEntity<BasicDTO<User>> profile(@RequestHeader(HttpHeaders.AUTHORIZATION) String token) {
        logger.info("[TYPE] incoming [METHOD] GET [API_NAME] profile");
        String userEmail = jwtUtil.getUsernameFromToken(token.replace("Bearer ", ""));
        Optional<User> us = userDAO.findUserByEmail(userEmail);
        if (us.isEmpty()) {
            logger.error("[TYPE] error [API_NAME] profile [ERROR] User not found");
            throw new UserNotFoundException();
        }
    
        logger.info("[TYPE] outgoing [METHOD] GET [API_NAME] profile [STATUS] SUCCESS");
        return new ResponseEntity<>(new BasicDTO<>(true, "profile data", us.get()), HttpStatus.OK);
    }
    
    @Operation(security = @SecurityRequirement(name = "bearerAuth"))
    @PutMapping("/profile")
    public ResponseEntity<BasicDTO<User>> updateProfile(@RequestHeader(HttpHeaders.AUTHORIZATION) String token, @RequestBody RegisterRequestDTO registerRequestDTO) {
        logger.info("[TYPE] incoming [METHOD] PUT [API_NAME] updateProfile");
        String userEmail = jwtUtil.getUsernameFromToken(token.replace("Bearer ", ""));
        Optional<User> us = userDAO.findUserByEmail(userEmail);
        if (us.isEmpty()) {
            logger.error("[TYPE] error [API_NAME] updateProfile [ERROR] User not found");
            throw new UserNotFoundException();
        }
    
        User user = us.get();
        user.setMobileNo(registerRequestDTO.getMobileNo());
        user.setFirstName(registerRequestDTO.getFirstName());
        user.setLastName(registerRequestDTO.getLastName());
        user.setEmail(registerRequestDTO.getEmail());
        user.setRole(UserRoleEnum.USER);
        user.setActive(true);
        user.setPassword(passwordEncoder.encode(registerRequestDTO.getPassword()));
        userDAO.save(user);
    
        logger.info("[TYPE] outgoing [METHOD] PUT [API_NAME] updateProfile [STATUS] SUCCESS");
        return new ResponseEntity<>(new BasicDTO<>(true, "Updated", user), HttpStatus.CREATED);
    }
    
    @Operation(security = @SecurityRequirement(name = "bearerAuth"))
    @PostMapping("/rates/calculate")
    public ResponseEntity<BasicDTO<RateCalculateReqDTO>> calculateRates(@RequestBody RateCalculateReqDTO r) {
        logger.info("[TYPE] incoming [METHOD] POST [API_NAME] calculateRates");
        Double amount = CalculationUtil.calculateRate(r.getWeight(), r.getDistance(), r.getOrderType());
        r.setAmount(amount);
    
        logger.info("[TYPE] outgoing [METHOD] POST [API_NAME] calculateRates [STATUS] SUCCESS");
        return new ResponseEntity<>(new BasicDTO<>(true, "Calculated amount", r), HttpStatus.OK);
    }
    



}
