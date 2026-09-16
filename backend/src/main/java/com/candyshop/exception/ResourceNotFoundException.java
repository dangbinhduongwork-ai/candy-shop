package com.candyshop.exception;

/**
 * Thrown when a resource is not found (e.g., user by ID).
 * Maps to HTTP 404 Not Found.
 */
public class ResourceNotFoundException extends RuntimeException {
    public ResourceNotFoundException(String message) {
        super(message);
    }
}
