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

import java.io.IOException;
import java.util.List;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

@Component
public class JwtAuthFilter extends OncePerRequestFilter {

    private static final Logger log = LoggerFactory.getLogger(JwtAuthFilter.class);

    private final JwtUtil jwtUtil;
    private final RedisTemplate<String, Object> redisTemplate;

    public JwtAuthFilter(JwtUtil jwtUtil, RedisTemplate<String, Object> redisTemplate) {
        this.jwtUtil = jwtUtil;
        this.redisTemplate = redisTemplate;
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

                // Check Redis blacklist
                String userId = claims.getSubject();
                String email  = claims.get("email", String.class);
                String role   = claims.get("role", String.class);
                if (role == null) role = "USER";

                var auth = new UsernamePasswordAuthenticationToken(
                        userId, email,
                        List.of(new SimpleGrantedAuthority("ROLE_" + role.toUpperCase()))
                );
                SecurityContextHolder.getContext().setAuthentication(auth);

            } catch (JwtException | IllegalArgumentException e) {
                log.debug("Invalid JWT: {}", e.getMessage());
                // Don't set auth — downstream will get 401 from security config
            }
        }
        chain.doFilter(request, response);
    }
}


