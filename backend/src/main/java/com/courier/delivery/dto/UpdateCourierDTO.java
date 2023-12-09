package com.courier.delivery.dto;

import com.courier.delivery.enums.CourierStatusEnum;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Data @NoArgsConstructor @AllArgsConstructor
public class UpdateCourierDTO {
    private LocalDate expectedDeliveryDate;
    private String currentLocation;
    private CourierStatusEnum status;
}
