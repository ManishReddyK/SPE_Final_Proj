package com.courier.delivery.models;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.courier.delivery.enums.UserRoleEnum;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import javax.persistence.*;
import java.util.Date;

@Entity @NoArgsConstructor @AllArgsConstructor @Data
public class User {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    private String firstName;
    private String lastName;
    private String email;
    private String mobileNo;
    @JsonIgnore
    private String password;
    private UserRoleEnum role;
    private Date createdOn;
    private Boolean active;
}
