package com.campushub.config;

import com.campushub.exception.RateLimitException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import org.springframework.web.servlet.HandlerInterceptor;

import java.util.concurrent.TimeUnit;

@Component
@RequiredArgsConstructor
public class RateLimitInterceptor implements HandlerInterceptor {

    private static final Logger log = LoggerFactory.getLogger(RateLimitInterceptor.class);

    @Value("${security.rate-limit.auth.max-attempts:5}")
    private int maxAttempts;

    @Value("${security.rate-limit.auth.window-seconds:900}")
    private long windowSeconds;

    private final RedisTemplate<String, Object> redisTemplate;

    @Override
    public boolean preHandle(HttpServletRequest request,
                             HttpServletResponse response,
                             Object handler) {

        String uri = request.getRequestURI();
        if (!isRateLimited(uri)) return true;

        String ip  = getClientIp(request);
        String key = "ratelimit:" + ip + ":" + normalizeEndpoint(uri);

        try {
            Long count = redisTemplate.opsForValue().increment(key);
            if (count == null) count = 1L;

            if (count == 1) {
                // First call — set TTL
                redisTemplate.expire(key, windowSeconds, TimeUnit.SECONDS);
            }

            if (count > maxAttempts) {
                Long ttl = redisTemplate.getExpire(key, TimeUnit.SECONDS);
                long retryAfter = (ttl != null && ttl > 0) ? ttl : windowSeconds;
                response.setHeader("Retry-After", String.valueOf(retryAfter));
                throw new RateLimitException(retryAfter);
            }
        } catch (RateLimitException e) {
            throw e; // Rethrow planned rate limit exceptions
        } catch (Exception e) {
            log.warn("Redis unavailable for rate limiting (fail-open) for IP {}: {}", ip, e.getMessage());
        }

        return true;
    }

    private boolean isRateLimited(String uri) {
        return uri.contains("/auth/login") || uri.contains("/auth/register");
    }

    private String normalizeEndpoint(String uri) {
        if (uri.contains("/login"))    return "login";
        if (uri.contains("/register")) return "register";
        return uri;
    }

    private String getClientIp(HttpServletRequest request) {
        String forwarded = request.getHeader("X-Forwarded-For");
        if (forwarded != null && !forwarded.isBlank()) {
            return forwarded.split(",")[0].trim();
        }
        return request.getRemoteAddr();
    }
}
