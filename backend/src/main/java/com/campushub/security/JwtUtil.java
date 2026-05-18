package com.campushub.security;

import io.jsonwebtoken.*;
import io.jsonwebtoken.io.Decoders;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import javax.crypto.SecretKey;
import java.util.Date;
import java.util.UUID;


@Component
public class JwtUtil {

    private final SecretKey key;
    private final long accessTtlMs;
    private final long refreshTtlMs;

    public JwtUtil(
            @Value("${jwt.secret:super_secret_jwt_key_for_campus_hub}") String secret,
            @Value("${jwt.access-token-expiry-ms:900000}") long accessTtlMs,
            @Value("${jwt.refresh-token-expiry-ms:604800000}") long refreshTtlMs) {
        this.key = Keys.hmacShaKeyFor(secret.getBytes());
        this.accessTtlMs = accessTtlMs;
        this.refreshTtlMs = refreshTtlMs;
    }

    /** Access token: 15 min, includes jti for blacklisting */
    public String generateAccessToken(String userId, String email, String role) {
        long now = System.currentTimeMillis();
        return Jwts.builder()
                .id(UUID.randomUUID().toString())          // jti
                .subject(userId)
                .claim("email", email)
                .claim("role", role)
                .claim("type", "access")
                .issuedAt(new Date(now))
                .expiration(new Date(now + accessTtlMs))
                .signWith(key)
                .compact();
    }

    /** Refresh token: 7 days */
    public String generateRefreshToken(String userId) {
        long now = System.currentTimeMillis();
        return Jwts.builder()
                .id(UUID.randomUUID().toString())
                .subject(userId.toString())
                .claim("type", "refresh")
                .issuedAt(new Date(now))
                .expiration(new Date(now + refreshTtlMs))
                .signWith(key)
                .compact();
    }

    /** Returns Claims or throws JwtException */
    public Claims validateToken(String token) {
        return Jwts.parser()
                .verifyWith(key)
                .build()
                .parseSignedClaims(token)
                .getPayload();
    }

    public String getJti(String token) {
        return validateToken(token).getId();
    }

    public String getSubject(String token) {
        return validateToken(token).getSubject();
    }

    public long getRemainingTtlSeconds(String token) {
        Date exp = validateToken(token).getExpiration();
        long remaining = exp.getTime() - System.currentTimeMillis();
        return Math.max(0, remaining / 1000);
    }

    // kept for backward compat with JwtAuthFilter
    public Claims parseToken(String token) {
        return validateToken(token);
    }

    public boolean isValid(String token) {
        try {
            validateToken(token);
            return true;
        } catch (JwtException | IllegalArgumentException e) {
            return false;
        }
    }
}


