package com.candyshop.exception;

/**
 * Thrown when a business rule is violated (e.g., duplicate email).
 * Maps to HTTP 400 Bad Request.
 */
public class BadRequestException extends RuntimeException {
    public BadRequestException(String message) {
        super(message);
    }
}
