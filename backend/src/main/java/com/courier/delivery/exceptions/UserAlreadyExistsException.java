package com.courier.delivery.exceptions;

public class UserAlreadyExistsException extends RuntimeException{
    public UserAlreadyExistsException() {
        super("User already existed. Please login");
    }
}
