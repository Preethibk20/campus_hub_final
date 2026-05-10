package com.campushub.controller;

import com.campushub.dto.auth.AuthResponse;
import com.campushub.dto.auth.LoginRequest;
import com.campushub.dto.auth.RegisterRequest;
import com.campushub.service.AuthService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;

    /** Step 1: register — sends OTP */
    @PostMapping("/register")
    public ResponseEntity<Map<String, String>> register(@Valid @RequestBody RegisterRequest req) {
        String msg = authService.register(req);
        return ResponseEntity.status(HttpStatus.CREATED).body(Map.of("message", msg));
    }

    /** Step 2: verify OTP — returns tokens */
    @PostMapping("/verify-otp")
    public ResponseEntity<AuthResponse> verifyOtp(@RequestBody Map<String, String> body) {
        return ResponseEntity.ok(authService.verifyOtp(body.get("email"), body.get("otp")));
    }

    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(@Valid @RequestBody LoginRequest req) {
        return ResponseEntity.ok(authService.login(req));
    }

    @PostMapping("/refresh")
    public ResponseEntity<AuthResponse> refresh(@RequestBody Map<String, String> body) {
        return ResponseEntity.ok(authService.refresh(body.get("refreshToken")));
    }

    /** Logout: pass both tokens so JTI can be blacklisted */
    @PostMapping("/logout")
    public ResponseEntity<Void> logout(@RequestBody Map<String, String> body,
                                       HttpServletRequest request) {
        String bearer = request.getHeader("Authorization");
        String accessToken = (bearer != null && bearer.startsWith("Bearer "))
                ? bearer.substring(7) : null;
        authService.logout(accessToken, body.get("refreshToken"));
        return ResponseEntity.noContent().build();
    }

    /** Resend OTP */
    @PostMapping("/verify/send")
    public ResponseEntity<Void> sendCode(@RequestBody Map<String, String> body) {
        authService.sendVerificationCode(body.get("email"));
        return ResponseEntity.accepted().build();
    }
}



