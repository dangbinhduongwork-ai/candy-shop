package com.candyshop.service;

import jakarta.servlet.http.HttpServletRequest;

/**
 * Service to protect against brute-force login attacks by tracking failed
 * login attempts per IP address and temporarily blocking abusive IPs.
 */
public interface LoginAttemptService {

    /** Maximum failed attempts allowed before blocking */
    int MAX_ATTEMPTS = 5;

    /** Lockout duration in minutes */
    int BLOCK_DURATION_MINUTES = 15;

    /** Record a successful login — resets attempt counter for the key/IP */
    void loginSucceeded(String key);

    /** Record a failed login attempt for the key/IP */
    void loginFailed(String key);

    /** Check if the key/IP is currently blocked */
    boolean isBlocked(String key);

    /** Get remaining block duration in minutes (rounded up) */
    long getRemainingBlockMinutes(String key);

    /** Get remaining block duration in seconds */
    long getRemainingBlockSeconds(String key);

    /** Get remaining attempts allowed before being blocked */
    int getRemainingAttempts(String key);

    /** Helper to extract real client IP address from HttpServletRequest */
    String getClientIp(HttpServletRequest request);
}
