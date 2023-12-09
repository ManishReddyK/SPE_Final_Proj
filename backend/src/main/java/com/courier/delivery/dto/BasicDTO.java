package com.courier.delivery.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data @NoArgsConstructor @AllArgsConstructor
public class BasicDTO<T> {
    private boolean isSuccess;
    private String message;
    private T data;
}
