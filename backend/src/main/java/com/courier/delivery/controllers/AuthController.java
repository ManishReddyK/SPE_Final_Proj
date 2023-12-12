package com.courier.delivery.controllers;

import com.courier.delivery.dao.UserDAO;
import com.courier.delivery.dto.*;
import com.courier.delivery.exceptions.PasswordAndConfirmPasswordNotMatchedException;
import com.courier.delivery.exceptions.UserAlreadyExistsException;
import com.courier.delivery.models.User;
import com.courier.delivery.utils.JWTUtil;
import com.courier.delivery.services.UserDetailsService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.Date;
import java.util.Optional;

// import org.apache.logging.log4j.LogManager;
// import org.apache.logging.log4j.Logger;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;


@RestController
@CrossOrigin
@RequestMapping("/api/auth")
public class AuthController {
    @Autowired
    UserDAO userDAO;

    @Autowired
    private PasswordEncoder passwordEncoder;
    @Autowired
    private AuthenticationManager authenticationManager;
    @Autowired
    private UserDetailsService userDetailsService;
    @Autowired
    private JWTUtil jwtUtil;

    private Logger logger = LoggerFactory.getLogger(AuthController.class);
    // private static final Logger logger = LogManager.getLogger(AuthController.class);

    @PostMapping("/register")
    public ResponseEntity<BasicDTO<RegisterResponseDTO>> registerUser(@RequestBody RegisterRequestDTO registerRequestDTO) {
        logger.info("[TYPE] incoming"+" [METHOD] POST"+" [API_NAME] registerUser");
        BasicDTO<RegisterResponseDTO> basicDTO = new BasicDTO<>();
        basicDTO.setData(null);
        basicDTO.setSuccess(false);
        if (!registerRequestDTO.getPassword().equals(registerRequestDTO.getConfirmPassword())) {
            logger.error("[TYPE] error"+" [API_NAME] registerUser"+" [ERROR] Password and Confirm Password do not match");
            throw new PasswordAndConfirmPasswordNotMatchedException();
        }
        if (userDAO.existsByEmail(registerRequestDTO.getEmail())) {
            logger.error("[TYPE] error\"+\" [API_NAME] registerUser"+" [ERROR] User with email {} already exists", registerRequestDTO.getEmail());
            throw new UserAlreadyExistsException();
        }
        User user = new User();
        user.setMobileNo(registerRequestDTO.getMobileNo());
        user.setFirstName(registerRequestDTO.getFirstName());
        user.setLastName(registerRequestDTO.getLastName());
        user.setEmail(registerRequestDTO.getEmail());
        user.setRole(registerRequestDTO.getRole());
        user.setActive(true);
        user.setPassword(passwordEncoder.encode(registerRequestDTO.getPassword()));
        user.setCreatedOn(new Date());
        userDAO.save(user);
        final UserDetails userDetails = userDetailsService.loadUserByUsername(user.getEmail());
        basicDTO.setData(new RegisterResponseDTO(jwtUtil.generateToken(userDetails), user.getEmail(), user.getFirstName()));
        basicDTO.setSuccess(true);
        logger.info("[TYPE] outgoing\"+\" [METHOD] POST\"+\" [API_NAME] registerUser"+" [STATUS] SUCCESS");
        return new ResponseEntity<>(basicDTO, HttpStatus.CREATED);
    }
    
    @PostMapping("/login")
    public ResponseEntity<BasicDTO<LoginResponseDTO>> login(@RequestBody LoginRequestDTO loginRequestDTO) {
        logger.info("[TYPE] incoming\"+\" [METHOD] POST\"+\" [API_NAME] login");
        BasicDTO<LoginResponseDTO> result = this.loginHelper(
                loginRequestDTO.getEmail(),
                loginRequestDTO.getPassword()
        );
        if (result.isSuccess()) {
            logger.info("[TYPE] outgoing\"+\" [METHOD] POST\"+\" [API_NAME] login\"+\" [STATUS] SUCCESS");
        } else {
            logger.error("[TYPE] error\"+\" [API_NAME] login\"+\" [ERROR] {}", result.getMessage());
        }
        return new ResponseEntity<>(result, result.isSuccess() ? HttpStatus.OK : HttpStatus.UNAUTHORIZED);
    }
    
    public BasicDTO<LoginResponseDTO> loginHelper(String email, String password) {
        logger.info("[TYPE] internal\"+\" [METHOD] loginHelper");
        BasicDTO<LoginResponseDTO> basicDTO = new BasicDTO<>();
        Optional<User> _user = userDAO.findUserByEmail(email);
        if (_user.isEmpty()) {
            logger.error("[TYPE] error\"+\" [METHOD] loginHelper\"+\" [ERROR] User not found");
            basicDTO.setMessage("User not found");
            return basicDTO;
        }
        User user = _user.get();
        if (!user.getActive()) {
            logger.error("[TYPE] error\"+\" [METHOD] loginHelper\"+\" [ERROR] User not active");
            basicDTO.setMessage("User not active");
            return basicDTO;
        }
    
        try {
            authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(
                            email,
                            password
                    )
            );
        } catch (BadCredentialsException e) {
            logger.error("[TYPE] error\"+\" [METHOD] loginHelper\"+\" [ERROR] Credentials not matched");
            basicDTO.setMessage("Credentials not matched");
            return basicDTO;
        }
    
        final UserDetails userDetails = userDetailsService.loadUserByUsername(user.getEmail());
        LoginResponseDTO loginResponseDTO = new LoginResponseDTO();
        loginResponseDTO.setToken(jwtUtil.generateToken(userDetails));
        loginResponseDTO.setUser(user);
        basicDTO.setData(loginResponseDTO);
        basicDTO.setSuccess(true);
        logger.info("[TYPE] internal\"+\" [METHOD] loginHelper\"+\" [STATUS] SUCCESS");
        return basicDTO;
    }
    

}
