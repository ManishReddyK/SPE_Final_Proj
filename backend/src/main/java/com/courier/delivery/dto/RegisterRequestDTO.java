package com.courier.delivery.dto;

import com.courier.delivery.enums.UserRoleEnum;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import javax.validation.constraints.NotBlank;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class RegisterRequestDTO {
    @NotBlank
    private String firstName;
    @NotBlank
    private String lastName;
    @NotBlank
    private String email;
    @NotBlank
    private String mobileNo;
    @NotBlank
    private String  password;
    @NotBlank
    private String  confirmPassword;
    @NotBlank
    private UserRoleEnum role;
}
