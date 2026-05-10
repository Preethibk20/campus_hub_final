package com.campushub.domain;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.mapping.Field;
import org.springframework.data.mongodb.core.mapping.DBRef;

import java.time.Instant;


@Document(collection = "match_requests")
public class MatchRequest {

    public enum Status { PENDING, ACCEPTED, REJECTED }

    @Id
    private String id;

    @DBRef
    private User sender;

    @DBRef
    private User recipient;

    private String postId;

    private String fromUserId;

    private String toUserId;

    private String message;

    private Status status = Status.PENDING;

    private Instant createdAt = Instant.now();

    private Instant respondedAt;

    private Instant updatedAt;

    public MatchRequest() {}

    public MatchRequest(String id, User sender, User recipient, String postId, String fromUserId, String toUserId, String message, Status status, Instant createdAt, Instant respondedAt, Instant updatedAt) {
        this.id = id;
        this.sender = sender;
        this.recipient = recipient;
        this.postId = postId;
        this.fromUserId = fromUserId;
        this.toUserId = toUserId;
        this.message = message;
        this.status = status;
        this.createdAt = createdAt;
        this.respondedAt = respondedAt;
        this.updatedAt = updatedAt;
    }

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }
    
    public String getRequestId() { return id; }
    public void setRequestId(String id) { this.id = id; }

    public User getSender() { return sender; }
    public void setSender(User sender) { this.sender = sender; }
    public User getRecipient() { return recipient; }
    public void setRecipient(User recipient) { this.recipient = recipient; }
    public String getPostId() { return postId; }
    public void setPostId(String postId) { this.postId = postId; }
    public String getFromUserId() { return fromUserId; }
    public void setFromUserId(String fromUserId) { this.fromUserId = fromUserId; }
    public String getToUserId() { return toUserId; }
    public void setToUserId(String toUserId) { this.toUserId = toUserId; }
    public String getMessage() { return message; }
    public void setMessage(String message) { this.message = message; }
    public Status getStatus() { return status; }
    public void setStatus(Status status) { this.status = status; }
    public Instant getCreatedAt() { return createdAt; }
    public void setCreatedAt(Instant createdAt) { this.createdAt = createdAt; }
    public Instant getRespondedAt() { return respondedAt; }
    public void setRespondedAt(Instant respondedAt) { this.respondedAt = respondedAt; }
    public Instant getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(Instant updatedAt) { this.updatedAt = updatedAt; }

    public static MatchRequestBuilder builder() { return new MatchRequestBuilder(); }

    public static class MatchRequestBuilder {
        private String id;
        private User sender;
        private User recipient;
        private String postId;
        private String fromUserId;
        private String toUserId;
        private String message;
        private Status status = Status.PENDING;
        private Instant createdAt;
        private Instant respondedAt;
        private Instant updatedAt;

        public MatchRequestBuilder id(String id) { this.id = id; return this; }
        public MatchRequestBuilder requestId(String id) { this.id = id; return this; }
        public MatchRequestBuilder sender(User sender) { this.sender = sender; return this; }
        public MatchRequestBuilder recipient(User recipient) { this.recipient = recipient; return this; }
        public MatchRequestBuilder postId(String postId) { this.postId = postId; return this; }
        public MatchRequestBuilder fromUserId(String fromUserId) { this.fromUserId = fromUserId; return this; }
        public MatchRequestBuilder toUserId(String toUserId) { this.toUserId = toUserId; return this; }
        public MatchRequestBuilder message(String message) { this.message = message; return this; }
        public MatchRequestBuilder status(Status status) { this.status = status; return this; }
        public MatchRequestBuilder createdAt(Instant createdAt) { this.createdAt = createdAt; return this; }
        public MatchRequestBuilder respondedAt(Instant respondedAt) { this.respondedAt = respondedAt; return this; }
        public MatchRequestBuilder updatedAt(Instant updatedAt) { this.updatedAt = updatedAt; return this; }

        public MatchRequest build() {
            return new MatchRequest(id, sender, recipient, postId, fromUserId, toUserId, message, status, createdAt, respondedAt, updatedAt);
        }
    }
}



