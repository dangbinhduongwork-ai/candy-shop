package com.candyshop.service;

import jakarta.servlet.http.HttpServletRequest;
import org.springframework.stereotype.Service;

import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.ConcurrentMap;

/**
 * In-memory thread-safe implementation of LoginAttemptService.
 */
@Service
public class LoginAttemptServiceImpl implements LoginAttemptService {

    private static final long ATTEMPT_WINDOW_MS = 15 * 60 * 1000L; // 15 minutes
    private static final long BLOCK_DURATION_MS = 15 * 60 * 1000L; // 15 minutes

    private static class AttemptRecord {
        int attempts;
        long firstAttemptTime;
        long blockedUntil;

        AttemptRecord(int attempts, long firstAttemptTime) {
            this.attempts = attempts;
            this.firstAttemptTime = firstAttemptTime;
            this.blockedUntil = 0;
        }
    }

    private final ConcurrentMap<String, AttemptRecord> attemptsCache = new ConcurrentHashMap<>();

    /**
     * Periodically cleans up expired attempts every 5 minutes to prevent memory leaks / OOM
     */
    @org.springframework.scheduling.annotation.Scheduled(fixedRate = 300000)
    public void cleanupExpiredAttempts() {
        long now = System.currentTimeMillis();
        attemptsCache.entrySet().removeIf(entry -> {
            AttemptRecord record = entry.getValue();
            if (record == null) return true;
            boolean blockExpired = record.blockedUntil > 0 && record.blockedUntil <= now;
            boolean windowExpired = record.blockedUntil == 0 && (now - record.firstAttemptTime > ATTEMPT_WINDOW_MS);
            return blockExpired || windowExpired;
        });
    }

    @Override
    public void loginSucceeded(String key) {
        if (key != null) {
            attemptsCache.remove(key);
        }
    }

    @Override
    public void loginFailed(String key) {
        if (key == null || key.isBlank()) return;

        long now = System.currentTimeMillis();
        attemptsCache.compute(key, (k, record) -> {
            if (record == null || (now - record.firstAttemptTime > ATTEMPT_WINDOW_MS && record.blockedUntil <= now)) {
                return new AttemptRecord(1, now);
            }

            record.attempts++;
            if (record.attempts >= MAX_ATTEMPTS) {
                record.blockedUntil = now + BLOCK_DURATION_MS;
            }
            return record;
        });
    }

    @Override
    public boolean isBlocked(String key) {
        if (key == null || key.isBlank()) return false;

        AttemptRecord record = attemptsCache.get(key);
        if (record == null) return false;

        long now = System.currentTimeMillis();
        if (record.blockedUntil > now) {
            return true;
        }

        // If block has expired or attempt window passed, cleanup
        if (record.blockedUntil > 0 && record.blockedUntil <= now) {
            attemptsCache.remove(key);
        } else if (now - record.firstAttemptTime > ATTEMPT_WINDOW_MS) {
            attemptsCache.remove(key);
        }

        return false;
    }

    @Override
    public long getRemainingBlockMinutes(String key) {
        long seconds = getRemainingBlockSeconds(key);
        if (seconds <= 0) return 0;
        return (long) Math.ceil((double) seconds / 60.0);
    }

    @Override
    public long getRemainingBlockSeconds(String key) {
        if (key == null || key.isBlank()) return 0;

        AttemptRecord record = attemptsCache.get(key);
        if (record == null || record.blockedUntil <= 0) return 0;

        long now = System.currentTimeMillis();
        long diff = record.blockedUntil - now;
        return diff > 0 ? diff / 1000 : 0;
    }

    @Override
    public int getRemainingAttempts(String key) {
        if (key == null || key.isBlank()) return MAX_ATTEMPTS;

        AttemptRecord record = attemptsCache.get(key);
        if (record == null) return MAX_ATTEMPTS;

        long now = System.currentTimeMillis();
        if (now - record.firstAttemptTime > ATTEMPT_WINDOW_MS && record.blockedUntil <= now) {
            attemptsCache.remove(key);
            return MAX_ATTEMPTS;
        }

        int remaining = MAX_ATTEMPTS - record.attempts;
        return Math.max(remaining, 0);
    }

    @Override
    public String getClientIp(HttpServletRequest request) {
        if (request == null) return "unknown";

        String xForwardedFor = request.getHeader("X-Forwarded-For");
        if (xForwardedFor != null && !xForwardedFor.isBlank() && !"unknown".equalsIgnoreCase(xForwardedFor)) {
            // If multiple proxies, first IP is the original client
            return xForwardedFor.split(",")[0].trim();
        }

        String xRealIp = request.getHeader("X-Real-IP");
        if (xRealIp != null && !xRealIp.isBlank() && !"unknown".equalsIgnoreCase(xRealIp)) {
            return xRealIp.trim();
        }

        return request.getRemoteAddr();
    }
}
