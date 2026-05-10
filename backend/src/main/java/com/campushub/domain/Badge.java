package com.campushub.domain;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.mapping.Field;
import org.springframework.data.mongodb.core.mapping.DBRef;

import java.time.Instant;


@Document(collection = "badges")
public class Badge {

    @Id
    private String id;

    @DBRef
    private User user;

    @Field("badge_key")
    private String badgeKey;

    @Field("awarded_at")
    private Instant awardedAt = Instant.now();

    public Badge() {}

    public Badge(String id, User user, String badgeKey, Instant awardedAt) {
        this.id = id;
        this.user = user;
        this.badgeKey = badgeKey;
        this.awardedAt = awardedAt;
    }

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }
    public User getUser() { return user; }
    public void setUser(User user) { this.user = user; }
    public String getBadgeKey() { return badgeKey; }
    public void setBadgeKey(String badgeKey) { this.badgeKey = badgeKey; }
    public Instant getAwardedAt() { return awardedAt; }
    public void setAwardedAt(Instant awardedAt) { this.awardedAt = awardedAt; }

    public static BadgeBuilder builder() { return new BadgeBuilder(); }

    public static class BadgeBuilder {
        private String id;
        private User user;
        private String badgeKey;
        private Instant awardedAt;

        public BadgeBuilder id(String id) { this.id = id; return this; }
        public BadgeBuilder user(User user) { this.user = user; return this; }
        public BadgeBuilder badgeKey(String badgeKey) { this.badgeKey = badgeKey; return this; }
        public BadgeBuilder awardedAt(Instant awardedAt) { this.awardedAt = awardedAt; return this; }

        public Badge build() {
            return new Badge(id, user, badgeKey, awardedAt);
        }
    }
}



