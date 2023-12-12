package com.courier.delivery.controllers;

import com.courier.delivery.dao.CourierDetailsDAO;
import com.courier.delivery.dao.UserDAO;
import com.courier.delivery.dto.BasicDTO;
import com.courier.delivery.dto.RegisterRequestDTO;
import com.courier.delivery.dto.RegisterResponseDTO;
import com.courier.delivery.enums.CourierStatusEnum;
import com.courier.delivery.enums.UserRoleEnum;
import com.courier.delivery.exceptions.CourierNotFoundException;
import com.courier.delivery.exceptions.PasswordAndConfirmPasswordNotMatchedException;
import com.courier.delivery.exceptions.UserAlreadyExistsException;
import com.courier.delivery.exceptions.UserNotFoundException;
import com.courier.delivery.models.CourierDetails;
import com.courier.delivery.models.User;
import com.courier.delivery.services.UserDetailsService;
import com.courier.delivery.utils.JWTUtil;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

// import org.slf4j.Logger;
// import org.slf4j.LoggerFactory;

import org.apache.logging.log4j.LogManager;
import org.apache.logging.log4j.Logger;
// import org.jboss.jandex.Main;

import java.util.Date;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@RestController
@CrossOrigin
@RequestMapping("/admin")
public class AdminController {
    @Autowired
    UserDAO userDAO;
    @Autowired
    CourierDetailsDAO courierDetailsDAO;
    @Autowired
    private PasswordEncoder passwordEncoder;
    @Autowired
    private UserDetailsService userDetailsService;
    @Autowired
    private JWTUtil jwtUtil;

    // private Logger logger = LogManager.getLogger(AdminController.class);
    private static final Logger logger = LogManager.getLogger(AdminController.class);

    @Operation(security = @SecurityRequirement(name = "bearerAuth"))
    @GetMapping("/courier/getAll")
    public ResponseEntity<BasicDTO<List<CourierDetails>>> courierGetAll() {
        logger.info("[TYPE] incoming [METHOD] GET [API_NAME] courierGetAll");
        List<CourierDetails> courierDetailsOptional = courierDetailsDAO.findAll();
        logger.info("[TYPE] outgoing [METHOD] GET [API_NAME] courierGetAll [STATUS] SUCCESS");
        return new ResponseEntity<>(new BasicDTO<>(true, "Orders List", courierDetailsOptional), HttpStatus.OK);
    }

    @Operation(security = @SecurityRequirement(name = "bearerAuth"))
    @DeleteMapping("/courier/delete/{orderId}")
    public ResponseEntity<BasicDTO<CourierDetails>> courierDelete(@PathVariable("orderId") Long orderId) {
        logger.info("[TYPE] incoming [METHOD] DELETE [API_NAME] courierDelete [ORDER_ID] {}", orderId);
        courierDetailsDAO.deleteById(orderId);
        logger.info("[TYPE] outgoing [METHOD] DELETE [API_NAME] courierDelete [STATUS] SUCCESS");
        return new ResponseEntity<>(new BasicDTO<>(true, "Delete successfully", null), HttpStatus.OK);
    }

    @Transactional
    @Operation(security = @SecurityRequirement(name = "bearerAuth"))
    @DeleteMapping("/agent/delete/{agentId}")
    public ResponseEntity<BasicDTO<CourierDetails>> agentDelete(@PathVariable("agentId") Long agentId) {
        logger.info("[TYPE] incoming [METHOD] DELETE [API_NAME] agentDelete [AGENT_ID] {}", agentId);
        List<CourierDetails> cdt = courierDetailsDAO.findByAgent_Id(agentId);
        var newCDT = cdt.stream().map(item -> {
            item.setAgent(null);
            return item;
        }).collect(Collectors.toList());
        courierDetailsDAO.saveAll(newCDT);
        userDAO.deleteById(agentId);
        logger.info("[TYPE] outgoing [METHOD] DELETE [API_NAME] agentDelete [STATUS] SUCCESS");
        return new ResponseEntity<>(new BasicDTO<>(true, "Delete successfully", null), HttpStatus.OK);
    }

    @Operation(security = @SecurityRequirement(name = "bearerAuth"))
    @GetMapping("/courier/assignAgent/{agentId}/{orderId}")
    public ResponseEntity<BasicDTO<CourierDetails>> courierAssignAgent(@PathVariable("agentId") Long agentId, @PathVariable("orderId") Long orderId) {
        logger.info("[TYPE] incoming [METHOD] GET [API_NAME] courierAssignAgent [AGENT_ID] {} [ORDER_ID] {}", agentId, orderId);
        Optional<User> us = userDAO.findById(agentId);
        if (us.isEmpty())
            throw new UserNotFoundException();
        Optional<CourierDetails> courierDetailsOptional = courierDetailsDAO.findById(orderId);
        if (courierDetailsOptional.isEmpty())
            throw new CourierNotFoundException();
        CourierDetails c = courierDetailsOptional.get();
        c.setAgent(us.get());
        c.setStatus(CourierStatusEnum.ASSIGNED);
        courierDetailsDAO.save(c);
        logger.info("[TYPE] outgoing [METHOD] GET [API_NAME] courierAssignAgent [STATUS] SUCCESS");
        return new ResponseEntity<>(new BasicDTO<>(true, "Details", c), HttpStatus.OK);
    }

    @Operation(security = @SecurityRequirement(name = "bearerAuth"))
    @GetMapping("/agent/getAll")
    public ResponseEntity<BasicDTO<List<User>>> agentsGetAll() {
        logger.info("[TYPE] incoming [METHOD] GET [API_NAME] agentsGetAll");
        List<User> agents = userDAO.findByRole(UserRoleEnum.AGENT);
        logger.info("[TYPE] outgoing [METHOD] GET [API_NAME] agentsGetAll [STATUS] SUCCESS");
        return new ResponseEntity<>(new BasicDTO<>(true, "agents List", agents), HttpStatus.OK);
    }

    @Operation(security = @SecurityRequirement(name = "bearerAuth"))
    @GetMapping("/users/getAll")
    public ResponseEntity<BasicDTO<List<User>>> usersGetAll() {
        logger.info("[TYPE] incoming [METHOD] GET [API_NAME] usersGetAll");
        List<User> agents = userDAO.findByRole(UserRoleEnum.USER);
        logger.info("[TYPE] outgoing [METHOD] GET [API_NAME] usersGetAll [STATUS] SUCCESS");
        return new ResponseEntity<>(new BasicDTO<>(true, "users List", agents), HttpStatus.OK);
    }

    @Operation(security = @SecurityRequirement(name = "bearerAuth"))
    @PostMapping("/agent/register")
    public ResponseEntity<BasicDTO<RegisterResponseDTO>> registerAgent(@RequestBody RegisterRequestDTO registerRequestDTO) {
        logger.info("[TYPE] incoming [METHOD] POST [API_NAME] registerAgent");
        BasicDTO<RegisterResponseDTO> basicDTO = new BasicDTO<>();
        basicDTO.setData(null);
        basicDTO.setSuccess(false);
        if (!registerRequestDTO.getPassword().equals(registerRequestDTO.getConfirmPassword())) {
            throw new PasswordAndConfirmPasswordNotMatchedException();
        }
        if (userDAO.existsByEmail(registerRequestDTO.getEmail())) {
            throw new UserAlreadyExistsException();
        }
        User user = new User();
        user.setMobileNo(registerRequestDTO.getMobileNo());
        user.setFirstName(registerRequestDTO.getFirstName());
        user.setLastName(registerRequestDTO.getLastName());
        user.setEmail(registerRequestDTO.getEmail());
        user.setRole(UserRoleEnum.AGENT);
        user.setActive(true);
        user.setPassword(passwordEncoder.encode(registerRequestDTO.getPassword()));
        user.setCreatedOn(new Date());
        userDAO.save(user);
        final UserDetails userDetails = userDetailsService.loadUserByUsername(user.getEmail());
        basicDTO.setData(new RegisterResponseDTO(jwtUtil.generateToken(userDetails), user.getEmail(), user.getFirstName()));
        basicDTO.setSuccess(true);
        logger.info("[TYPE] outgoing [METHOD] POST [API_NAME] registerAgent [STATUS] SUCCESS");
        return new ResponseEntity<>(basicDTO, HttpStatus.CREATED);
    }

    @Operation(security = @SecurityRequirement(name = "bearerAuth"))
    @GetMapping("/profile")
    public ResponseEntity<BasicDTO<User>> profile(@RequestHeader(HttpHeaders.AUTHORIZATION) String token) {
        logger.info("[TYPE] incoming [METHOD] GET [API_NAME] profile");
        String userEmail = jwtUtil.getUsernameFromToken(token.replace("Bearer ", ""));
        Optional<User> us = userDAO.findUserByEmail(userEmail);
        if (us.isEmpty())
            throw new UserNotFoundException();
        logger.info("[TYPE] outgoing [METHOD] GET [API_NAME] profile [STATUS] SUCCESS");
        return new ResponseEntity<>(new BasicDTO<>(true, "profile data", us.get()), HttpStatus.OK);
    }

    @Operation(security = @SecurityRequirement(name = "bearerAuth"))
    @PutMapping("/profile")
    public ResponseEntity<BasicDTO<User>> updateProfile(@RequestHeader(HttpHeaders.AUTHORIZATION) String token, @RequestBody RegisterRequestDTO registerRequestDTO) {
        logger.info("[TYPE] incoming [METHOD] PUT [API_NAME] updateProfile");
        String userEmail = jwtUtil.getUsernameFromToken(token.replace("Bearer ", ""));
        Optional<User> us = userDAO.findUserByEmail(userEmail);
        if (us.isEmpty())
            throw new UserNotFoundException();
        User user = us.get();
        user.setMobileNo(registerRequestDTO.getMobileNo());
        user.setFirstName(registerRequestDTO.getFirstName());
        user.setLastName(registerRequestDTO.getLastName());
        user.setEmail(registerRequestDTO.getEmail());
        user.setRole(UserRoleEnum.ADMIN);
        user.setActive(true);
        user.setPassword(passwordEncoder.encode(registerRequestDTO.getPassword()));
        userDAO.save(user);
        logger.info("[TYPE] outgoing [METHOD] PUT [API_NAME] updateProfile [STATUS] SUCCESS");
        return new ResponseEntity<>(new BasicDTO<>(true, "Updated", user), HttpStatus.CREATED);
    }

    @Operation(security = @SecurityRequirement(name = "bearerAuth"))
    @PutMapping("/agent/update/profile/{agentId}")
    public ResponseEntity<BasicDTO<User>> updateAgentProfile(@PathVariable("agentId") Long agentId, @RequestBody RegisterRequestDTO registerRequestDTO) {
        logger.info("[TYPE] incoming [METHOD] PUT [API_NAME] updateAgentProfile [AGENT_ID] {}", agentId);
        Optional<User> us = userDAO.findById(agentId);
        if (us.isEmpty())
            throw new UserNotFoundException();
        User user = us.get();
        user.setMobileNo(registerRequestDTO.getMobileNo());
        user.setFirstName(registerRequestDTO.getFirstName());
        user.setLastName(registerRequestDTO.getLastName());
        user.setEmail(registerRequestDTO.getEmail());
        user.setRole(UserRoleEnum.AGENT);
        user.setActive(true);
        user.setPassword(passwordEncoder.encode(registerRequestDTO.getPassword()));
        userDAO.save(user);
        logger.info("[TYPE] outgoing [METHOD] PUT [API_NAME] updateAgentProfile [STATUS] SUCCESS");
        return new ResponseEntity<>(new BasicDTO<>(true, "Updated", user), HttpStatus.CREATED);
    }
    
}
