package com.campushub.domain;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.mapping.Field;
import org.springframework.data.mongodb.core.mapping.DBRef;

import java.time.Instant;


@Document(collection = "conversations")
public class Conversation {

    @Id
    private String id;

    @DBRef
    private Gig gig;

    @DBRef
    private Order order;

    @DBRef
    private User participantA;

    @DBRef
    private User participantB;

    @Field("created_at")
    private Instant createdAt = Instant.now();

    public Conversation() {}

    public Conversation(String id, Gig gig, Order order, User participantA, User participantB, Instant createdAt) {
        this.id = id;
        this.gig = gig;
        this.order = order;
        this.participantA = participantA;
        this.participantB = participantB;
        this.createdAt = createdAt;
    }

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }
    public Gig getGig() { return gig; }
    public void setGig(Gig gig) { this.gig = gig; }
    public Order getOrder() { return order; }
    public void setOrder(Order order) { this.order = order; }
    public User getParticipantA() { return participantA; }
    public void setParticipantA(User participantA) { this.participantA = participantA; }
    public User getParticipantB() { return participantB; }
    public void setParticipantB(User participantB) { this.participantB = participantB; }
    public Instant getCreatedAt() { return createdAt; }
    public void setCreatedAt(Instant createdAt) { this.createdAt = createdAt; }

    public static ConversationBuilder builder() { return new ConversationBuilder(); }

    public static class ConversationBuilder {
        private String id;
        private Gig gig;
        private Order order;
        private User participantA;
        private User participantB;
        private Instant createdAt;

        public ConversationBuilder id(String id) { this.id = id; return this; }
        public ConversationBuilder gig(Gig gig) { this.gig = gig; return this; }
        public ConversationBuilder order(Order order) { this.order = order; return this; }
        public ConversationBuilder participantA(User participantA) { this.participantA = participantA; return this; }
        public ConversationBuilder participantB(User participantB) { this.participantB = participantB; return this; }
        public ConversationBuilder createdAt(Instant createdAt) { this.createdAt = createdAt; return this; }

        public Conversation build() {
            return new Conversation(id, gig, order, participantA, participantB, createdAt);
        }
    }
}



