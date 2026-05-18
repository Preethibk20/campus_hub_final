package com.campushub.config;

import com.campushub.security.JwtAuthFilter;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.*;
import jakarta.servlet.http.HttpServletResponse;

import java.util.List;

@Configuration
@EnableWebSecurity
@EnableMethodSecurity
@RequiredArgsConstructor
public class SecurityConfig {

    private final JwtAuthFilter jwtAuthFilter;

    @Value("${cors.allowed-origin:http://localhost:5173}")
    private String allowedOrigin;

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        return http
                .csrf(AbstractHttpConfigurer::disable)
                .cors(cors -> cors.configurationSource(corsConfigurationSource()))
                .sessionManagement(s -> s.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .headers(headers -> headers
                        .contentTypeOptions(org.springframework.security.config.annotation.web.configurers.HeadersConfigurer.ContentTypeOptionsConfig::disable)
                        .addHeaderWriter((req, res) -> {
                            res.setHeader("X-Content-Type-Options", "nosniff");
                            res.setHeader("X-Frame-Options", "SAMEORIGIN");
                            res.setHeader("Referrer-Policy", "strict-origin-when-cross-origin");
                            res.setHeader("Content-Security-Policy", "default-src * 'unsafe-inline' 'unsafe-eval' https://*.cloudinary.com; img-src * data: blob:; script-src * 'unsafe-inline' 'unsafe-eval'; frame-src * https://*.cloudinary.com;");
                        })
                )
                .authorizeHttpRequests(auth -> auth
                        .requestMatchers(org.springframework.http.HttpMethod.OPTIONS, "/**").permitAll()
                        
                        // Explicitly protect authenticated endpoints
                        .requestMatchers("/api/users/me", "/api/users/me/**").authenticated()
                        .requestMatchers("/api/gigs/my", "/api/gigs/my/**").authenticated()
                        .requestMatchers("/api/gigs/*/apply").authenticated()
                        .requestMatchers("/api/gigs/*/interest").authenticated()
                        .requestMatchers("/api/gigs/*/applications").authenticated()
                        .requestMatchers("/api/gigs/*/applicants/**").authenticated()
                        
                        // Admin endpoints
                        .requestMatchers("/api/admin/**", "/api/v1/admin/**").hasRole("ADMIN")
                        
                        // Public endpoints — NO private user data
                        .requestMatchers(
                                "/api/auth/**",
                                "/api/v1/auth/**",
                                "/api/matching/posts/**",
                                "/actuator/health/**",
                                "/ws/**"
                        ).permitAll()
                        // Public profile — authenticated users only (prevents anonymous enumeration)
                        .requestMatchers("/api/profile/**").authenticated()
                        .requestMatchers(org.springframework.http.HttpMethod.GET, "/api/gigs", "/api/gigs/*").permitAll()
                        
                        // Any other request needs authentication
                        .anyRequest().authenticated()
                )
                .exceptionHandling(ex -> ex
                        .authenticationEntryPoint((req, res, authException) -> {
                            res.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
                            res.setContentType("application/json");
                            res.getWriter().write("{\"error\": \"Unauthorized\", \"message\": \"Authentication required\"}");
                        })
                )
                .addFilterBefore(jwtAuthFilter, UsernamePasswordAuthenticationFilter.class)
                .build();
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder(12);
    }

    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration config) throws Exception {
        return config.getAuthenticationManager();
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        var config = new CorsConfiguration();
        
        // Handle multiple origins from property
        if (allowedOrigin != null && !allowedOrigin.isBlank()) {
            config.setAllowedOrigins(java.util.Arrays.asList(allowedOrigin.split(",")));
        } else {
            config.setAllowedOrigins(List.of("http://localhost:3000", "http://localhost:5173"));
        }
        
        config.setAllowedMethods(List.of("GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"));
        config.setAllowedHeaders(List.of("*"));
        config.setAllowCredentials(true);
        config.setMaxAge(3600L);
        
        var source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", config);
        return source;
    }
}


