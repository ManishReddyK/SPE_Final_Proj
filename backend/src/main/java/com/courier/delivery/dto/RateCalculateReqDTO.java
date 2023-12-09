package com.courier.delivery.dto;

import com.courier.delivery.enums.OrderTypeEnum;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data @NoArgsConstructor @AllArgsConstructor
public class RateCalculateReqDTO {
    private Double weight;
    private Double distance;
    private OrderTypeEnum orderType;
    private Double amount;
}
