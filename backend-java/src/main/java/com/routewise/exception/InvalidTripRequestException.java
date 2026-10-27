package com.routewise.exception;

public class InvalidTripRequestException extends RuntimeException {
    public InvalidTripRequestException(String message) {
        super(message);
    }
}
