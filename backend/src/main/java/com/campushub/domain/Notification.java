package com.campushub.domain;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.mapping.Field;
import org.springframework.data.mongodb.core.mapping.DBRef;

import java.time.Instant;

import java.util.Map;

@Document(collection = "notifications")
public class Notification {

    @Id
    private String id;

    @DBRef
    private User user;

    private String type;

    private String title;

    private String body;

    @Field("is_read")
    private boolean isRead = false;

    private Map<String, Object> metadata;

    @Field("created_at")
    private Instant createdAt = Instant.now();

    public Notification() {}

    public Notification(String id, User user, String type, String title, String body, boolean isRead, Map<String, Object> metadata, Instant createdAt) {
        this.id = id;
        this.user = user;
        this.type = type;
        this.title = title;
        this.body = body;
        this.isRead = isRead;
        this.metadata = metadata;
        this.createdAt = createdAt;
    }

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }
    public User getUser() { return user; }
    public void setUser(User user) { this.user = user; }
    public String getType() { return type; }
    public void setType(String type) { this.type = type; }
    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }
    public String getBody() { return body; }
    public void setBody(String body) { this.body = body; }
    public boolean isRead() { return isRead; }
    public void setRead(boolean isRead) { this.isRead = isRead; }
    public Map<String, Object> getMetadata() { return metadata; }
    public void setMetadata(Map<String, Object> metadata) { this.metadata = metadata; }
    public Instant getCreatedAt() { return createdAt; }
    public void setCreatedAt(Instant createdAt) { this.createdAt = createdAt; }

    public static NotificationBuilder builder() { return new NotificationBuilder(); }

    public static class NotificationBuilder {
        private String id;
        private User user;
        private String type;
        private String title;
        private String body;
        private boolean isRead = false;
        private Map<String, Object> metadata;
        private Instant createdAt;

        public NotificationBuilder id(String id) { this.id = id; return this; }
        public NotificationBuilder user(User user) { this.user = user; return this; }
        public NotificationBuilder type(String type) { this.type = type; return this; }
        public NotificationBuilder title(String title) { this.title = title; return this; }
        public NotificationBuilder body(String body) { this.body = body; return this; }
        public NotificationBuilder isRead(boolean isRead) { this.isRead = isRead; return this; }
        public NotificationBuilder metadata(Map<String, Object> metadata) { this.metadata = metadata; return this; }
        public NotificationBuilder createdAt(Instant createdAt) { this.createdAt = createdAt; return this; }

        public Notification build() {
            return new Notification(id, user, type, title, body, isRead, metadata, createdAt);
        }
    }
}



