package com.courier.delivery.models;

import com.courier.delivery.enums.CourierStatusEnum;
import com.courier.delivery.enums.OrderTypeEnum;
import com.fasterxml.jackson.annotation.JsonIgnore;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import javax.persistence.*;
import java.time.LocalDate;

@Entity
@NoArgsConstructor
@AllArgsConstructor
@Data
public class CourierDetails {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    private String source;
    private String destination;
    private Double weight;
    private Double distance;
    private Double amount;
    private LocalDate createdOn;
    private LocalDate expectedDeliveryDate;
    private String paymentMode;
    private String paymentDetails;
    private String currentLocation;
    private CourierStatusEnum status;
    private OrderTypeEnum orderType;

    @OneToOne
    @JsonIgnore
    private User user;
    @OneToOne
    @JsonIgnore
    private User agent;

}
