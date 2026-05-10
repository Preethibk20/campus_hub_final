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
        if (userRepository.existsByEmail(req.email())) {
            throw ApiException.conflict("Email already registered");
        }

        User user = User.builder()
                .name(req.name())
                .email(req.email())
                .password(passwordEncoder.encode(req.password()))
                .role("USER")
                .collegeId(null)
                .isVerified(false)
                .build();
        userRepository.save(user);

        String otp = String.format("%06d", secureRandom.nextInt(999999));
        log.info("Generated OTP for {}: {}", req.email(), otp);

        try {
            redisTemplate.opsForValue().set("otp:" + req.email(), otp, 5, TimeUnit.MINUTES);
            log.info("Stored OTP in Redis for {}", req.email());
        } catch (Exception e) {
            log.error("Failed to store OTP in Redis: {}", e.getMessage());
            throw new RuntimeException("Failed to store OTP. Please try again.");
        }

        sendOtpEmail(req.email(), otp);
        return "OTP sent to your email";
    }

    @Override
    @Transactional
    public AuthResponse verifyOtp(String email, String otp) {
        String stored = (String) redisTemplate.opsForValue().get("otp:" + email);

        if (stored == null) {
            throw ApiException.badRequest("OTP expired. Please request a new one.");
        }
        if (!stored.equals(otp)) {
            throw ApiException.badRequest("Incorrect OTP.");
        }

        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> ApiException.notFound("User not found"));
        user.setVerified(true);
        userRepository.save(user);
        redisTemplate.delete("otp:" + email);

        return buildTokenPair(user);
    }

    @Override
    @Transactional
    public AuthResponse login(LoginRequest req) {
        try {
            log.info("Login attempt for email: {}", req.email());
            User user = userRepository.findByEmail(req.email())
                    .orElseThrow(() -> {
                        log.warn("Login failed: no user found for email {}", req.email());
                        return new BadCredentialsException("Invalid email or password");
                    });

            log.info("User found: id={}, name={}, verified={}, passwordHash prefix={}", 
                user.getId(), user.getName(), user.isVerified(),
                user.getPassword() != null ? user.getPassword().substring(0, 10) : "NULL");

            if (!passwordEncoder.matches(req.password(), user.getPassword())) {
                log.warn("Login failed: password mismatch for {}", req.email());
                throw new BadCredentialsException("Invalid email or password");
            }

            if (!user.isVerified()) {
                throw new EmailNotVerifiedException("Please verify your email first.");
            }

            if (user.isBanned()) {
                throw new AccountBannedException("Your account has been banned.");
            }

            return buildTokenPair(user);

        } catch (BadCredentialsException | EmailNotVerifiedException | AccountBannedException e) {
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
        redisTemplate.opsForValue().set("otp:" + email, otp, 5, TimeUnit.MINUTES);
        sendOtpEmail(email, otp);
    }

    @Override
    @Transactional
    public void verifyEmail(String email, String code) {
        verifyOtp(email, code);
    }

    // ── private helpers ───────────────────────────────────────────────────

    private void sendOtpEmail(String toEmail, String otp) {
        try {
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            headers.set("api-key", brevoApiKey);

            String body = """
                    {
                      "sender": {"name": "Campus Hub", "email": "noreply@campushub.in"},
                      "to": [{"email": "%s"}],
                      "subject": "Your Campus Hub OTP",
                      "textContent": "Your OTP is %s. Valid for 5 minutes. Do not share this with anyone."
                    }
                    """.formatted(toEmail, otp);

            HttpEntity<String> request = new HttpEntity<>(body, headers);
            restTemplate.postForEntity(
                    "https://api.brevo.com/v3/smtp/email",
                    request,
                    String.class);
            log.info("OTP email sent to {} via Brevo API", toEmail);

        } catch (Exception e) {
            log.error("Brevo send failed to {}: {}", toEmail, e.getMessage());
            throw new RuntimeException("Could not send OTP email. Please try again.");
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