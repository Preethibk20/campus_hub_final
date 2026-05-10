package com.campushub.security;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.JwtException;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import java.util.Base64;
import java.util.UUID;

import static org.assertj.core.api.Assertions.*;

class JwtUtilTest {

    private JwtUtil jwtUtil;
    private static final String SECRET =
            Base64.getEncoder().encodeToString("test-secret-minimum-32-chars-ok!!".getBytes());

    @BeforeEach
    void setUp() {
        // 15 min access, 7 day refresh
        jwtUtil = new JwtUtil(SECRET, 900_000L, 604_800_000L);
    }

    @Test
    void accessToken_isValid_andContainsClaims() {
        String userId = UUID.randomUUID().toString();
        String token = jwtUtil.generateAccessToken(userId, "test@college.edu", "student");

        assertThat(jwtUtil.isValid(token)).isTrue();
        Claims claims = jwtUtil.validateToken(token);
        assertThat(claims.getSubject()).isEqualTo(userId);
        assertThat(claims.get("role", String.class)).isEqualTo("student");
        assertThat(claims.get("email", String.class)).isEqualTo("test@college.edu");
        assertThat(claims.getId()).isNotBlank(); // jti present
    }

    @Test
    void refreshToken_isValid_andHasNoRole() {
        String userId = UUID.randomUUID().toString();
        String token = jwtUtil.generateRefreshToken(userId);

        assertThat(jwtUtil.isValid(token)).isTrue();
        Claims claims = jwtUtil.validateToken(token);
        assertThat(claims.getSubject()).isEqualTo(userId);
        assertThat(claims.get("type", String.class)).isEqualTo("refresh");
    }

    @Test
    void getJti_returnsUniqueIds() {
        String userId = UUID.randomUUID().toString();
        String t1 = jwtUtil.generateAccessToken(userId, "a@b.com", "student");
        String t2 = jwtUtil.generateAccessToken(userId, "a@b.com", "student");
        assertThat(jwtUtil.getJti(t1)).isNotEqualTo(jwtUtil.getJti(t2));
    }

    @Test
    void expiredToken_isInvalid() {
        // TTL = 1ms → immediately expired
        JwtUtil shortLived = new JwtUtil(SECRET, 1L, 1L);
        String token = shortLived.generateAccessToken(UUID.randomUUID().toString(), "x@y.com", "student");
        // Give it a moment to expire
        try { Thread.sleep(10); } catch (InterruptedException ignored) {}
        assertThat(shortLived.isValid(token)).isFalse();
    }

    @Test
    void tamperedToken_throwsJwtException() {
        String token = jwtUtil.generateAccessToken(UUID.randomUUID().toString(), "x@y.com", "student");
        String tampered = token.substring(0, token.length() - 4) + "XXXX";
        assertThatThrownBy(() -> jwtUtil.validateToken(tampered))
                .isInstanceOf(JwtException.class);
    }

    @Test
    void getRemainingTtl_isPositive() {
        String token = jwtUtil.generateAccessToken(UUID.randomUUID().toString(), "x@y.com", "student");
        assertThat(jwtUtil.getRemainingTtlSeconds(token)).isGreaterThan(0);
    }
}
