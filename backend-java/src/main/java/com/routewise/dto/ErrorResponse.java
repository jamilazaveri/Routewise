package com.routewise.dto;

import java.time.LocalDateTime;
import java.util.List;

public class ErrorResponse {

    private LocalDateTime timestamp = LocalDateTime.now();
    private int status;
    private String error;
    private String message;
    private List<String> validationErrors;

    public ErrorResponse() {}

    public ErrorResponse(int status, String error, String message) {
        this.status = status;
        this.error = error;
        this.message = message;
    }

    public ErrorResponse(int status, String error, String message, List<String> validationErrors) {
        this.status = status;
        this.error = error;
        this.message = message;
        this.validationErrors = validationErrors;
    }

    public LocalDateTime getTimestamp() { return timestamp; }
    public int getStatus() { return status; }
    public String getError() { return error; }
    public String getMessage() { return message; }
    public List<String> getValidationErrors() { return validationErrors; }
}
