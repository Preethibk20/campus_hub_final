package com.campushub.domain;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.mapping.Field;

import java.time.Instant;

@Document(collection = "gig_applications")
public class GigApplication {

    public enum Status { pending, accepted, rejected }

    @Id
    private String id;

    // Support both old 'gig' field (DBRef) and new 'gig_id' field
    @Field("gig")
    private Object gigRaw;
    
    @Field("gig_id")
    private String gigId;

    // Support both old 'applicant' field (DBRef) and new 'applicant_id' field
    @Field("applicant")
    private Object applicantRaw;
    
    @Field("applicant_id")
    private String applicantId;

    private Status status = Status.pending;

    @Field("created_at")
    private Instant createdAt = Instant.now();

    public GigApplication() {}

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getGigId() { 
        if (gigId != null) return gigId;
        return extractId(gigRaw);
    }
    public void setGigId(String gigId) { this.gigId = gigId; }

    public String getApplicantId() { 
        if (applicantId != null) return applicantId;
        return extractId(applicantRaw);
    }
    public void setApplicantId(String applicantId) { this.applicantId = applicantId; }

    private String extractId(Object raw) {
        if (raw == null) return null;
        if (raw instanceof String) return (String) raw;
        if (raw instanceof org.bson.Document doc) {
            Object id = doc.get("$id");
            return id != null ? id.toString() : null;
        }
        if (raw instanceof com.mongodb.DBRef) {
            return ((com.mongodb.DBRef) raw).getId().toString();
        }
        return raw.toString();
    }

    public Status getStatus() { return status; }
    public void setStatus(Status status) { this.status = status; }
    public Instant getCreatedAt() { return createdAt; }
    public void setCreatedAt(Instant createdAt) { this.createdAt = createdAt; }

    public static GigApplicationBuilder builder() { return new GigApplicationBuilder(); }

    public static class GigApplicationBuilder {
        private String id;
        private String gigId;
        private String applicantId;
        private Status status = Status.pending;
        private Instant createdAt;

        public GigApplicationBuilder id(String id) { this.id = id; return this; }
        public GigApplicationBuilder gigId(String gigId) { this.gigId = gigId; return this; }
        public GigApplicationBuilder applicantId(String applicantId) { this.applicantId = applicantId; return this; }
        public GigApplicationBuilder status(Status status) { this.status = status; return this; }
        public GigApplicationBuilder createdAt(Instant createdAt) { this.createdAt = createdAt; return this; }

        public GigApplication build() {
            GigApplication app = new GigApplication();
            app.setId(id);
            app.setGigId(gigId);
            app.setApplicantId(applicantId);
            app.setStatus(status);
            if (createdAt != null) app.setCreatedAt(createdAt);
            return app;
        }
    }
}
