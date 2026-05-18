package com.campushub.security;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.JwtException;
import jakarta.servlet.*;
import jakarta.servlet.http.*;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;
import com.campushub.repository.UserRepository;

import java.io.IOException;
import java.util.List;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

@Component
public class JwtAuthFilter extends OncePerRequestFilter {

    private static final Logger log = LoggerFactory.getLogger(JwtAuthFilter.class);

    private final JwtUtil jwtUtil;
    private final RedisTemplate<String, Object> redisTemplate;
    private final UserRepository userRepository;

    public JwtAuthFilter(JwtUtil jwtUtil, RedisTemplate<String, Object> redisTemplate, UserRepository userRepository) {
        this.jwtUtil = jwtUtil;
        this.redisTemplate = redisTemplate;
        this.userRepository = userRepository;
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request,
                                    HttpServletResponse response,
                                    FilterChain chain) throws ServletException, IOException {

        String header = request.getHeader("Authorization");
        if (header != null && header.startsWith("Bearer ")) {
            String token = header.substring(7);
            try {
                Claims claims = jwtUtil.validateToken(token);
                
                String jti = claims.getId();
                if (jti != null && Boolean.TRUE.equals(redisTemplate.hasKey("blacklist:" + jti))) {
                    log.warn("Attempt to use blacklisted JWT for {}", request.getRequestURI());
                    throw new JwtException("Token has been blacklisted");
                }

                String userId = claims.getSubject();

                // Re-read role from DB — never trust the role baked in the JWT token
                // This prevents a demoted/banned user from retaining elevated privileges
                String liveRole;
                try {
                    liveRole = userRepository.findById(userId)
                            .map(u -> u.getRole() != null ? u.getRole().toUpperCase() : "USER")
                            .orElse(null);
                } catch (Exception e) {
                    log.warn("DB role lookup failed for user {}, falling back to JWT claim", userId);
                    liveRole = claims.get("role", String.class);
                }

                if (liveRole == null) {
                    log.warn("User {} not found in DB, rejecting token", userId);
                    chain.doFilter(request, response);
                    return;
                }

                log.debug("JWT valid for user: {}, live role from DB: {}", userId, liveRole);

                var auth = new UsernamePasswordAuthenticationToken(
                        userId, null,
                        List.of(new SimpleGrantedAuthority("ROLE_" + liveRole))
                );
                SecurityContextHolder.getContext().setAuthentication(auth);
                log.info("Successfully authenticated user: {} (role={}) for {}", userId, liveRole, request.getRequestURI());

            } catch (io.jsonwebtoken.ExpiredJwtException e) {
                log.warn("JWT Expired for {}: {}", request.getRequestURI(), e.getMessage());
            } catch (io.jsonwebtoken.SignatureException e) {
                log.warn("JWT Signature mismatch for {}: {}", request.getRequestURI(), e.getMessage());
            } catch (JwtException | IllegalArgumentException e) {
                log.warn("Invalid JWT for {}: {}", request.getRequestURI(), e.getMessage());
            } catch (Exception e) {
                log.error("Unexpected error during JWT validation for {}: {}", request.getRequestURI(), e.getMessage());
            }
        } else {
            if (request.getRequestURI().startsWith("/api/gigs/my") || request.getRequestURI().startsWith("/api/users/me")) {
                log.warn("MISSING Authorization header for protected route: {}", request.getRequestURI());
            }
        }
        chain.doFilter(request, response);
    }
}


