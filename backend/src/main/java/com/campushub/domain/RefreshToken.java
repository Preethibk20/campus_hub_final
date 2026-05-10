package com.campushub.domain;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.mapping.Field;
import org.springframework.data.mongodb.core.mapping.DBRef;

import java.time.Instant;


@Document(collection = "refresh_tokens")
public class RefreshToken {

    @Id
    private String id;

    @DBRef
    private User user;

    private String token;

    @Field("expires_at")
    private Instant expiresAt;

    @Field("created_at")
    private Instant createdAt = Instant.now();

    public RefreshToken() {}

    public RefreshToken(String id, User user, String token, Instant expiresAt, Instant createdAt) {
        this.id = id;
        this.user = user;
        this.token = token;
        this.expiresAt = expiresAt;
        this.createdAt = createdAt;
    }

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }
    public User getUser() { return user; }
    public void setUser(User user) { this.user = user; }
    public String getToken() { return token; }
    public void setToken(String token) { this.token = token; }
    public Instant getExpiresAt() { return expiresAt; }
    public void setExpiresAt(Instant expiresAt) { this.expiresAt = expiresAt; }
    public Instant getCreatedAt() { return createdAt; }
    public void setCreatedAt(Instant createdAt) { this.createdAt = createdAt; }

    public static RefreshTokenBuilder builder() { return new RefreshTokenBuilder(); }

    public static class RefreshTokenBuilder {
        private String id;
        private User user;
        private String token;
        private Instant expiresAt;
        private Instant createdAt;

        public RefreshTokenBuilder id(String id) { this.id = id; return this; }
        public RefreshTokenBuilder user(User user) { this.user = user; return this; }
        public RefreshTokenBuilder token(String token) { this.token = token; return this; }
        public RefreshTokenBuilder expiresAt(Instant expiresAt) { this.expiresAt = expiresAt; return this; }
        public RefreshTokenBuilder createdAt(Instant createdAt) { this.createdAt = createdAt; return this; }

        public RefreshToken build() {
            return new RefreshToken(id, user, token, expiresAt, createdAt);
        }
    }
}



