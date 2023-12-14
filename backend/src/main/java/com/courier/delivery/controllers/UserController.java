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

// import org.apache.logging.log4j.LogManager;
// import org.apache.logging.log4j.Logger;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;


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

    private Logger logger = LoggerFactory.getLogger(UserController.class);
    // private static final Logger logger = LogManager.getLogger(UserController.class);

    private void logInfo(String type, String method, String apiName, String additionalInfo) {
        String logMessage = String.format("[TYPE] %s [METHOD] %s [API_NAME] %s %s", type, method, apiName, additionalInfo);
        logger.info(logMessage);
    }

    @Operation(security = @SecurityRequirement(name = "bearerAuth"))
    @PostMapping("/courier/create")
    public ResponseEntity<BasicDTO<CourierDetails>> createCourier(@RequestBody CourierDetails r, @RequestHeader(HttpHeaders.AUTHORIZATION) String token) {
        logInfo("incoming", "POST", "createCourier", "");
        String userEmail = jwtUtil.getUsernameFromToken(token.replace("Bearer ", ""));
        Optional<User> us = userDAO.findUserByEmail(userEmail);
        if (us.isEmpty()) {
            logInfo("error", "POST", "createCourier", "[ERROR] User not found");
            throw new UserNotFoundException();
        }

        r.setCreatedOn(LocalDate.now());
        r.setStatus(CourierStatusEnum.PENDING);
        r.setId(null);
        r.setUser(us.get());
        r.setAgent(null);
        r.setExpectedDeliveryDate(LocalDate.now().plusDays(5));
        courierDetailsDAO.save(r);

        logInfo("outgoing", "POST", "createCourier", "[STATUS] SUCCESS");
        return new ResponseEntity<>(new BasicDTO<>(true, "Successfully create", r), HttpStatus.CREATED);
    }

    @Operation(security = @SecurityRequirement(name = "bearerAuth"))
    @GetMapping("/courier/trackById/{id}")
    public ResponseEntity<BasicDTO<CourierDetails>> courierTrackById(@PathVariable("id") Long id) {
        logInfo("incoming", "GET", "courierTrackById", "");
        Optional<CourierDetails> courierDetailsOptional = courierDetailsDAO.findById(id);
        if (courierDetailsOptional.isEmpty()) {
            logInfo("error", "GET", "courierTrackById", String.format("[ERROR] Courier not found for id: %d", id));
            throw new CourierNotFoundException();
        }

        logInfo("outgoing", "GET", "courierTrackById", "[STATUS] SUCCESS");
        return new ResponseEntity<>(new BasicDTO<>(true, "Order details", courierDetailsOptional.get()), HttpStatus.OK);
    }
    
    @Operation(security = @SecurityRequirement(name = "bearerAuth"))
    @GetMapping("/courier/myOrders")
    public ResponseEntity<BasicDTO<List<CourierDetails>>> courierMyOrders(@RequestHeader(HttpHeaders.AUTHORIZATION) String token) {
        logInfo("incoming", "GET", "courierMyOrders", "");
        String userEmail = jwtUtil.getUsernameFromToken(token.replace("Bearer ", ""));
        Optional<User> us = userDAO.findUserByEmail(userEmail);
        if (us.isEmpty()) {
            logInfo("error", "GET", "courierMyOrders", "[ERROR] User not found");
            throw new UserNotFoundException();
        }

        List<CourierDetails> courierDetailsOptional = courierDetailsDAO.findByUser(us.get());

        logInfo("outgoing", "GET", "courierMyOrders", "[STATUS] SUCCESS");
        return new ResponseEntity<>(new BasicDTO<>(true, "Orders List", courierDetailsOptional), HttpStatus.OK);
    }

    @Operation(security = @SecurityRequirement(name = "bearerAuth"))
    @GetMapping("/profile")
    public ResponseEntity<BasicDTO<User>> profile(@RequestHeader(HttpHeaders.AUTHORIZATION) String token) {
        logInfo("incoming", "GET", "profile", "");
        String userEmail = jwtUtil.getUsernameFromToken(token.replace("Bearer ", ""));
        Optional<User> us = userDAO.findUserByEmail(userEmail);
        if (us.isEmpty()) {
            logInfo("error", "GET", "profile", "[ERROR] User not found");
            throw new UserNotFoundException();
        }

        logInfo("outgoing", "GET", "profile", "[STATUS] SUCCESS");
        return new ResponseEntity<>(new BasicDTO<>(true, "profile data", us.get()), HttpStatus.OK);
    }

    @Operation(security = @SecurityRequirement(name = "bearerAuth"))
    @PutMapping("/profile")
    public ResponseEntity<BasicDTO<User>> updateProfile(@RequestHeader(HttpHeaders.AUTHORIZATION) String token, @RequestBody RegisterRequestDTO registerRequestDTO) {
        logInfo("incoming", "PUT", "updateProfile", "");
        String userEmail = jwtUtil.getUsernameFromToken(token.replace("Bearer ", ""));
        Optional<User> us = userDAO.findUserByEmail(userEmail);
        if (us.isEmpty()) {
            logInfo("error", "PUT", "updateProfile", "[ERROR] User not found");
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

        logInfo("outgoing", "PUT", "updateProfile", "[STATUS] SUCCESS");
        return new ResponseEntity<>(new BasicDTO<>(true, "Updated", user), HttpStatus.CREATED);
    }

    @Operation(security = @SecurityRequirement(name = "bearerAuth"))
    @PostMapping("/rates/calculate")
    public ResponseEntity<BasicDTO<RateCalculateReqDTO>> calculateRates(@RequestBody RateCalculateReqDTO r) {
        logInfo("incoming", "POST", "calculateRates", "");
        Double amount = CalculationUtil.calculateRate(r.getWeight(), r.getDistance(), r.getOrderType());
        r.setAmount(amount/1000);

        logInfo("outgoing", "POST", "calculateRates", "[STATUS] SUCCESS");
        return new ResponseEntity<>(new BasicDTO<>(true, "Calculated amount", r), HttpStatus.OK);
    }
    



}
