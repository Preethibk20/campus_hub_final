package com.campushub.service.impl;

import com.campushub.domain.RefreshToken;
import com.campushub.domain.User;
import com.campushub.dto.auth.AuthResponse;
import com.campushub.dto.auth.LoginRequest;
import com.campushub.dto.auth.RegisterRequest;
import com.campushub.exception.AccountBannedException;
import com.campushub.exception.ApiException;
import com.campushub.exception.EmailNotVerifiedException;
import com.campushub.repository.CollegeRepository;
import com.campushub.repository.RefreshTokenRepository;
import com.campushub.repository.UserRepository;
import com.campushub.security.JwtUtil;
import com.campushub.service.AuthService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.client.RestTemplate;

import java.security.SecureRandom;
import java.time.Duration;
import java.time.Instant;
import java.util.concurrent.TimeUnit;

@Service
public class AuthServiceImpl implements AuthService {

    private static final Logger log = LoggerFactory.getLogger(AuthServiceImpl.class);
    private static final Duration OTP_TTL = Duration.ofMinutes(5);
    private static final Duration REFRESH_TTL = Duration.ofDays(7);
    private static final SecureRandom secureRandom = new SecureRandom();

    private final UserRepository userRepository;
    private final CollegeRepository collegeRepository;
    private final RefreshTokenRepository refreshTokenRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;
    private final RedisTemplate<String, Object> redisTemplate;
    private final org.springframework.data.mongodb.core.MongoTemplate mongoTemplate;
    private final RestTemplate restTemplate = new RestTemplate();

    @Value("${brevo.api.key}")
    private String brevoApiKey;

    public AuthServiceImpl(
            UserRepository userRepository,
            CollegeRepository collegeRepository,
            RefreshTokenRepository refreshTokenRepository,
            PasswordEncoder passwordEncoder,
            JwtUtil jwtUtil,
            RedisTemplate<String, Object> redisTemplate,
            org.springframework.data.mongodb.core.MongoTemplate mongoTemplate) {
        this.userRepository = userRepository;
        this.collegeRepository = collegeRepository;
        this.refreshTokenRepository = refreshTokenRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtUtil = jwtUtil;
        this.redisTemplate = redisTemplate;
        this.mongoTemplate = mongoTemplate;
    }

    @Override
    @Transactional
    public String register(RegisterRequest req) {
        String email = req.email().toLowerCase().trim();
        String domain = email.substring(email.indexOf("@") + 1);
        log.info("Registration attempt for email: {} with domain: {}", email, domain);

        try {
            java.util.Optional<User> existingUser = userRepository.findByEmail(email);

            if (existingUser.isPresent()) {
                User user = existingUser.get();
                if (user.isVerified()) {
                    log.warn("Registration failed: Email {} is already verified", email);
                    throw ApiException.conflict("This email is already registered and verified. Please log in.");
                } else {
                    log.info("User {} exists but is unverified. Re-sending OTP.", email);
                    // Continue to send OTP to allow them to verify
                }
            } else {
                log.info("Creating new unverified user record for {}", email);
                User newUser = User.builder()
                        .name(req.name())
                        .email(email)
                        .password(passwordEncoder.encode(req.password()))
                        .role("USER")
                        .isVerified(false)
                        .build();
                userRepository.save(newUser);
            }

            String otp = String.format("%06d", secureRandom.nextInt(999999));
            log.info("************************************************");
            log.info("OTP FOR {}: {}", email, otp);
            log.info("************************************************");

            try {
                redisTemplate.opsForValue().set("otp:" + email, otp, 10, TimeUnit.MINUTES);
                log.info("OTP stored in Redis for {}", email);
            } catch (Exception e) {
                log.error("CRITICAL: Redis failed to store OTP: {}", e.getMessage());
                // Non-fatal, user can still see OTP in terminal
            }

            try {
                sendOtpEmail(email, otp);
            } catch (Exception e) {
                log.error("Email delivery failed, but OTP is in terminal: {}", e.getMessage());
                // Non-fatal for registration flow
            }

            return "OTP sent successfully. Please check your email or terminal.";

        } catch (ApiException e) {
            throw e;
        } catch (Exception e) {
            log.error("CRITICAL REGISTRATION FAILURE for {}:", email, e);
            throw new RuntimeException("Registration failed: " + e.getMessage());
        }
    }

    @Override
    @Transactional
    public AuthResponse verifyOtp(String email, String otp) {
        String stored = null;
        try {
            stored = (String) redisTemplate.opsForValue().get("otp:" + email);
        } catch (Exception e) {
            log.error("Failed to retrieve OTP from Redis for {}: {}", email, e.getMessage());
        }

        if (stored == null) {
            throw ApiException.badRequest("OTP expired or Redis unavailable. Please request a new one.");
        }
        if (!stored.equals(otp)) {
            throw ApiException.badRequest("Incorrect OTP.");
        }

        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> ApiException.notFound("User not found"));
        user.setVerified(true);
        userRepository.save(user);

        try {
            redisTemplate.delete("otp:" + email);
        } catch (Exception e) {
            log.warn("Failed to delete OTP from Redis after verification: {}", e.getMessage());
        }

        return buildTokenPair(user);
    }

    @Override
    @Transactional
    public AuthResponse login(LoginRequest req) {
        try {
            log.info("Login attempt for email: {}", req.email());
            String email = req.email().toLowerCase().trim();
            
            User user = userRepository.findByEmail(email)
                    .orElseThrow(() -> new ApiException("Invalid email or password", HttpStatus.BAD_REQUEST));

            if (!passwordEncoder.matches(req.password(), user.getPassword())) {
                log.warn("Login failed: password mismatch for {}", email);
                throw new ApiException("Invalid email or password", HttpStatus.BAD_REQUEST);
            }

            if (!user.isVerified()) {
                throw new ApiException("Please verify your email first.", HttpStatus.FORBIDDEN);
            }

            if (user.isBanned()) {
                throw new ApiException("Your account has been banned.", HttpStatus.FORBIDDEN);
            }

            return buildTokenPair(user);

        } catch (ApiException e) {
            throw e;
        } catch (Exception e) {
            log.error("Login failed for {}: {}", req.email(), e.getMessage(), e);
            throw e;
        }
    }

    @Override
    @Transactional
    public AuthResponse refresh(String refreshToken) {
        RefreshToken rt = refreshTokenRepository.findByToken(refreshToken)
                .orElseThrow(() -> ApiException.badRequest("Invalid refresh token"));
        if (rt.getExpiresAt().isBefore(Instant.now())) {
            refreshTokenRepository.delete(rt);
            throw ApiException.badRequest("Refresh token expired");
        }
        refreshTokenRepository.delete(rt);
        return buildTokenPair(rt.getUser());
    }

    @Override
    @Transactional
    public void logout(String accessToken, String refreshToken) {
        if (accessToken != null && !accessToken.isBlank()) {
            try {
                String jti = jwtUtil.getJti(accessToken);
                long ttl = jwtUtil.getRemainingTtlSeconds(accessToken);
                if (ttl > 0) {
                    redisTemplate.opsForValue().set("blacklist:" + jti, "1", ttl, TimeUnit.SECONDS);
                }
            } catch (Exception ignored) {
            }
        }
        if (refreshToken != null && !refreshToken.isBlank()) {
            refreshTokenRepository.findByToken(refreshToken)
                    .ifPresent(refreshTokenRepository::delete);
        }
    }

    @Override
    public void sendVerificationCode(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> ApiException.notFound("User not found"));
        String otp = String.format("%06d", secureRandom.nextInt(999999));
        try {
            redisTemplate.opsForValue().set("otp:" + email, otp, 5, TimeUnit.MINUTES);
        } catch (Exception e) {
            log.error("Failed to store verification OTP in Redis for {}: {}", email, e.getMessage());
        }
        sendOtpEmail(email, otp);
    }

    @Override
    @Transactional
    public void verifyEmail(String email, String code) {
        verifyOtp(email, code);
    }

    @Value("${brevo.user:noreply@campushub.in}")
    private String brevoUser;

    // ── private helpers ───────────────────────────────────────────────────

    private void sendOtpEmail(String toEmail, String otp) {
        try {
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            headers.setAccept(java.util.List.of(MediaType.APPLICATION_JSON));
            headers.set("api-key", brevoApiKey != null ? brevoApiKey.trim() : "");
            headers.set("x-sib-api-key", brevoApiKey != null ? brevoApiKey.trim() : "");

            String body = """
                    {
                      "sender": {"name": "Campus Hub", "email": "%s"},
                      "to": [{"email": "%s"}],
                      "subject": "Your Campus Hub OTP",
                      "textContent": "Your OTP is %s. Valid for 5 minutes. Do not share this with anyone."
                    }
                    """.formatted(brevoUser, toEmail, otp);

            HttpEntity<String> request = new HttpEntity<>(body, headers);
            restTemplate.postForEntity(
                    "https://api.brevo.com/v3/smtp/email",
                    request,
                    String.class);
            log.info("OTP email sent successfully to {} via Brevo API", toEmail);

        } catch (Exception e) {
            log.error("Brevo OTP send failed to {}: {}", toEmail, e.getMessage());
            // We throw an exception to let the user know something went wrong with the verification process
            throw new RuntimeException("Could not send OTP email. Please check your configuration or try again.");
        }
    }

    private void saveRefreshToken(String userId, String token) {
        User user = null;
        try {
            if (org.bson.types.ObjectId.isValid(userId)) {
                org.bson.Document doc = mongoTemplate.getCollection("users")
                    .find(new org.bson.Document("_id", new org.bson.types.ObjectId(userId)))
                    .first();
                if (doc != null) {
                    user = mongoTemplate.getConverter().read(User.class, doc);
                }
            }
            if (user == null) {
                org.bson.Document doc = mongoTemplate.getCollection("users")
                    .find(new org.bson.Document("_id", userId))
                    .first();
                if (doc != null) {
                    user = mongoTemplate.getConverter().read(User.class, doc);
                }
            }
        } catch (Exception ignored) {}

        if (user == null) {
            user = userRepository.findById(userId)
                    .orElseThrow(() -> ApiException.notFound("User not found"));
        }

        RefreshToken rt = RefreshToken.builder()
                .user(user)
                .token(token)
                .expiresAt(Instant.now().plus(REFRESH_TTL))
                .build();
        refreshTokenRepository.save(rt);
    }

    private AuthResponse buildTokenPair(User user) {
        String access = jwtUtil.generateAccessToken(user.getId(), user.getEmail(), user.getRole());
        String refresh = jwtUtil.generateRefreshToken(user.getId());

        RefreshToken rt = RefreshToken.builder()
                .user(user)
                .token(refresh)
                .expiresAt(Instant.now().plus(REFRESH_TTL))
                .build();
        refreshTokenRepository.save(rt);

        return new AuthResponse(
                access, refresh,
                user.getId(), user.getName(), user.getEmail(),
                user.getRole(), user.getProfilePicUrl());
    }
}