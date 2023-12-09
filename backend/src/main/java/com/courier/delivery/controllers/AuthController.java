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

    @PostMapping("/register")
    public ResponseEntity<BasicDTO<RegisterResponseDTO>> registerUser(@RequestBody RegisterRequestDTO registerRequestDTO) {
        BasicDTO<RegisterResponseDTO> basicDTO = new BasicDTO<>();
        basicDTO.setData(null);
        basicDTO.setSuccess(false);
        if( !registerRequestDTO.getPassword().equals(registerRequestDTO.getConfirmPassword()) ){
            throw new PasswordAndConfirmPasswordNotMatchedException();
        }
        if(userDAO.existsByEmail(registerRequestDTO.getEmail()) ){
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
        return new ResponseEntity<>(basicDTO, HttpStatus.CREATED);
    }

    @PostMapping("/login")
    public ResponseEntity<BasicDTO<LoginResponseDTO>> login(@RequestBody LoginRequestDTO loginRequestDTO){
        BasicDTO<LoginResponseDTO> result = this.loginHelper(
                loginRequestDTO.getEmail(),
                loginRequestDTO.getPassword()
        );
        return new ResponseEntity<>(result, result.isSuccess() ? HttpStatus.OK : HttpStatus.UNAUTHORIZED);
    }
    public BasicDTO<LoginResponseDTO> loginHelper(String email, String password) {
        BasicDTO<LoginResponseDTO> basicDTO = new BasicDTO<>();
        Optional<User> _user = userDAO.findUserByEmail(email);
        if(_user.isEmpty()){
            basicDTO.setMessage("User not found");
            return basicDTO;
        }
        User user = _user.get();
        if(!user.getActive()){
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
            basicDTO.setMessage("Credentials not matched");
            return basicDTO;
        }

        final UserDetails userDetails = userDetailsService.loadUserByUsername(user.getEmail());
        LoginResponseDTO loginResponseDTO = new LoginResponseDTO();
        loginResponseDTO.setToken(jwtUtil.generateToken(userDetails));
        loginResponseDTO.setUser(user);
        basicDTO.setData(loginResponseDTO);
        basicDTO.setSuccess(true);
        return basicDTO;
    }

}
