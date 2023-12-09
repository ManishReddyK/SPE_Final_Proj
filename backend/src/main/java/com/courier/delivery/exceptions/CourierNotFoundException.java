package com.courier.delivery.exceptions;

public class CourierNotFoundException extends RuntimeException {
    public CourierNotFoundException(){
        super("Courier not found");
    }
}
