package com.candyshop.security;

import io.github.bucket4j.Bandwidth;
import io.github.bucket4j.Bucket;
import io.github.bucket4j.Refill;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.time.Duration;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

/**
 * Enterprise IP-based Token Bucket Rate Limiting Filter using Bucket4j.
 * Protects sensitive endpoints (/api/auth/**, /api/orders/**) from DDoS and brute force.
 */
@Component
public class RateLimitingFilter extends OncePerRequestFilter {

    private final Map<String, Bucket> authBuckets = new ConcurrentHashMap<>();
    private final Map<String, Bucket> orderBuckets = new ConcurrentHashMap<>();

    private Bucket createAuthBucket() {
        // 20 requests per minute for auth endpoints
        Bandwidth limit = Bandwidth.classic(20, Refill.greedy(20, Duration.ofMinutes(1)));
        return Bucket.builder().addLimit(limit).build();
    }

    private Bucket createOrderBucket() {
        // 30 requests per minute for order endpoints
        Bandwidth limit = Bandwidth.classic(30, Refill.greedy(30, Duration.ofMinutes(1)));
        return Bucket.builder().addLimit(limit).build();
    }

    private String getClientIp(HttpServletRequest request) {
        String xfHeader = request.getHeader("X-Forwarded-For");
        if (xfHeader == null || xfHeader.isBlank()) {
            return request.getRemoteAddr();
        }
        return xfHeader.split(",")[0].trim();
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request,
                                    HttpServletResponse response,
                                    FilterChain filterChain) throws ServletException, IOException {
        String path = request.getRequestURI();
        String clientIp = getClientIp(request);

        if (path.startsWith("/api/auth/login") || path.startsWith("/api/auth/register")) {
            Bucket bucket = authBuckets.computeIfAbsent(clientIp, k -> createAuthBucket());
            if (!bucket.tryConsume(1)) {
                sendRateLimitError(response, "Bạn đã gửi quá nhiều yêu cầu đăng nhập/đăng ký. Vui lòng chờ 1 phút.");
                return;
            }
        } else if (path.startsWith("/api/orders") && "POST".equalsIgnoreCase(request.getMethod())) {
            Bucket bucket = orderBuckets.computeIfAbsent(clientIp, k -> createOrderBucket());
            if (!bucket.tryConsume(1)) {
                sendRateLimitError(response, "Hệ thống đang xử lý đơn hàng của bạn. Vui lòng không nhấn liên tục.");
                return;
            }
        }

        filterChain.doFilter(request, response);
    }

    private void sendRateLimitError(HttpServletResponse response, String message) throws IOException {
        response.setStatus(HttpStatus.TOO_MANY_REQUESTS.value());
        response.setContentType(MediaType.APPLICATION_JSON_VALUE);
        response.setCharacterEncoding("UTF-8");
        response.setHeader("Retry-After", "60");
        String json = String.format("{\"status\":429,\"message\":\"%s\",\"error\":\"Too Many Requests\"}", message);
        response.getWriter().write(json);
    }
}
