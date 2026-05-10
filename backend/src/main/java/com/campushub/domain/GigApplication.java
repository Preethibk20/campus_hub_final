package com.campushub.domain;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.mapping.Field;
import org.springframework.data.mongodb.core.mapping.DBRef;

import java.time.Instant;


@Document(collection = "gig_applications")
public class GigApplication {

    public enum Status { pending, accepted, rejected }

    @Id
    private String id;

    @DBRef
    private Gig gig;

    @DBRef
    private User applicant;

    private Status status = Status.pending;

    @Field("created_at")
    private Instant createdAt = Instant.now();

    public GigApplication() {}

    public GigApplication(String id, Gig gig, User applicant, Status status, Instant createdAt) {
        this.id = id;
        this.gig = gig;
        this.applicant = applicant;
        this.status = status;
        this.createdAt = createdAt;
    }

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }
    public Gig getGig() { return gig; }
    public void setGig(Gig gig) { this.gig = gig; }
    public User getApplicant() { return applicant; }
    public void setApplicant(User applicant) { this.applicant = applicant; }
    public Status getStatus() { return status; }
    public void setStatus(Status status) { this.status = status; }
    public Instant getCreatedAt() { return createdAt; }
    public void setCreatedAt(Instant createdAt) { this.createdAt = createdAt; }

    public static GigApplicationBuilder builder() { return new GigApplicationBuilder(); }

    public static class GigApplicationBuilder {
        private String id;
        private Gig gig;
        private User applicant;
        private Status status = Status.pending;
        private Instant createdAt;

        public GigApplicationBuilder id(String id) { this.id = id; return this; }
        public GigApplicationBuilder gig(Gig gig) { this.gig = gig; return this; }
        public GigApplicationBuilder applicant(User applicant) { this.applicant = applicant; return this; }
        public GigApplicationBuilder status(Status status) { this.status = status; return this; }
        public GigApplicationBuilder createdAt(Instant createdAt) { this.createdAt = createdAt; return this; }

        public GigApplication build() {
            return new GigApplication(id, gig, applicant, status, createdAt);
        }
    }
}



