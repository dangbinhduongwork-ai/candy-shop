package com.candyshop.exception;

import java.time.LocalDateTime;
import java.util.Map;

/**
 * Standardized error response body returned for all API errors.
 */
public class ErrorResponse {

    private int status;
    private String message;
    private LocalDateTime timestamp;
    private Map<String, String> errors; // field-level validation errors (optional)

    public ErrorResponse() {}

    /** Constructor for simple errors without field details */
    public ErrorResponse(int status, String message) {
        this.status = status;
        this.message = message;
        this.timestamp = LocalDateTime.now();
    }

    /** Constructor for validation errors with field-level details */
    public ErrorResponse(int status, String message, LocalDateTime timestamp,
                         Map<String, String> errors) {
        this.status = status;
        this.message = message;
        this.timestamp = timestamp;
        this.errors = errors;
    }

    public int getStatus() { return status; }
    public void setStatus(int status) { this.status = status; }

    public String getMessage() { return message; }
    public void setMessage(String message) { this.message = message; }

    public LocalDateTime getTimestamp() { return timestamp; }
    public void setTimestamp(LocalDateTime timestamp) { this.timestamp = timestamp; }

    public Map<String, String> getErrors() { return errors; }
    public void setErrors(Map<String, String> errors) { this.errors = errors; }
}
