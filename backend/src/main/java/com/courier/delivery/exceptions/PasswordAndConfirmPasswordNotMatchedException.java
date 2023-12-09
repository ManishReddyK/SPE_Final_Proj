package com.courier.delivery.exceptions;

public class PasswordAndConfirmPasswordNotMatchedException extends RuntimeException{
    public PasswordAndConfirmPasswordNotMatchedException() {
        super("Password and confirm password not matched");
    }
}
