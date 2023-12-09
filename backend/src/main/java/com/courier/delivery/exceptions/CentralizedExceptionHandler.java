package com.courier.delivery.exceptions;

import com.courier.delivery.dto.BasicDTO;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestControllerAdvice;

@RestControllerAdvice
public class CentralizedExceptionHandler {
    @ResponseStatus(HttpStatus.NOT_FOUND)
    @ExceptionHandler(CourierNotFoundException.class)
    public BasicDTO<String> handleCourierNotFoundException(CourierNotFoundException e) {
        return new BasicDTO<>(false,  e.getMessage(), "Exception");
    }
    @ResponseStatus(HttpStatus.NOT_FOUND)
    @ExceptionHandler(UserNotFoundException.class)
    public BasicDTO<String> handleUserNotFoundException(UserNotFoundException e) {
        return new BasicDTO<>(false,  e.getMessage(), "Exception");
    }

    @ResponseStatus(HttpStatus.BAD_REQUEST)
    @ExceptionHandler(PasswordAndConfirmPasswordNotMatchedException.class)
    public BasicDTO<String> handlePasswordAndConfirmPasswordNotMatchedException (PasswordAndConfirmPasswordNotMatchedException e) {
        return new BasicDTO<>(false,  e.getMessage(), "Exception");
    }
    @ResponseStatus(HttpStatus.CONFLICT)
    @ExceptionHandler(UserAlreadyExistsException.class)
    public BasicDTO<String> handleUserAlreadyExistsException (UserAlreadyExistsException e) {
        return new BasicDTO<>(false,  e.getMessage(), "Exception");
    }

}
