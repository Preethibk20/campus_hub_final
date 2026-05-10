package com.campushub.domain;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.mapping.Field;
import jakarta.validation.constraints.*;
import org.hibernate.annotations.CreationTimestamp;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.ArrayList;
import java.util.List;


@Document(collection = "gigs")
public class Gig {

    public enum Category { TECH, DESIGN, MARKETING, CONTENT, OTHER }
    public enum Type     { PAID, COLLAB }
    public enum Status   { OPEN, CLOSED, IN_PROGRESS, CANCELLED }

    @Id
    private String gigId;

    @NotBlank(message = "Title is required")
    @Size(max = 100, message = "Title must be under 100 characters")
    private String title;

    @NotBlank(message = "Description is required")
    @Size(max = 2000, message = "Description is too long")
    private String description;

    @NotNull(message = "Category is required")
    private Category category;

    @NotNull(message = "Type is required")
    private Type type;

    @DecimalMin(value = "0.0", inclusive = true, message = "Budget cannot be negative")
    private BigDecimal budget;

    @NotEmpty(message = "At least one skill is required")
    private List<String> skillsRequired;

    @NotNull(message = "PostedBy user ID is required")
    @Field("posted_by")
    private String postedBy;

    @NotNull(message = "Status is required")
    @Field("status")
    private Status status = Status.OPEN;

    @CreationTimestamp
    @Field("created_at")
    private Instant createdAt = Instant.now();

    @Field("interested_users")
    private List<String> interestedUsers = new ArrayList<>();

    @Field("accepted_users")
    private List<String> acceptedUsers = new ArrayList<>();

    @Field("rejected_users")
    private List<String> rejectedUsers = new ArrayList<>();

    public Gig() {}

    public Gig(String gigId, String title, String description, Category category, Type type, BigDecimal budget, List<String> skillsRequired, String postedBy, Status status, Instant createdAt) {
        this.gigId = gigId;
        this.title = title;
        this.description = description;
        this.category = category;
        this.type = type;
        this.budget = budget;
        this.skillsRequired = skillsRequired;
        this.postedBy = postedBy;
        this.status = (status != null) ? status : Status.OPEN;
        this.createdAt = (createdAt != null) ? createdAt : Instant.now();
    }

    public String getGigId() { return gigId; }
    public void setGigId(String gigId) { this.gigId = gigId; }
    public String getId() { return gigId; }
    public void setId(String id) { this.gigId = id; }
    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
    public Category getCategory() { return category; }
    public void setCategory(Category category) { this.category = category; }
    public Type getType() { return type; }
    public void setType(Type type) { this.type = type; }
    public BigDecimal getBudget() { return budget; }
    public void setBudget(BigDecimal budget) { this.budget = budget; }
    public List<String> getSkillsRequired() { return skillsRequired; }
    public void setSkillsRequired(List<String> skillsRequired) { this.skillsRequired = skillsRequired; }
    public String getPostedBy() { return postedBy; }
    public void setPostedBy(String postedBy) { this.postedBy = postedBy; }
    public Status getStatus() { return status; }
    public void setStatus(Status status) { this.status = status; }
    public Instant getCreatedAt() { return createdAt; }
    public void setCreatedAt(Instant createdAt) { this.createdAt = createdAt; }
    public List<String> getInterestedUsers() { return interestedUsers; }
    public void setInterestedUsers(List<String> interestedUsers) { this.interestedUsers = interestedUsers; }
    public List<String> getAcceptedUsers() { return acceptedUsers; }
    public void setAcceptedUsers(List<String> acceptedUsers) { this.acceptedUsers = acceptedUsers; }
    public List<String> getRejectedUsers() { return rejectedUsers; }
    public void setRejectedUsers(List<String> rejectedUsers) { this.rejectedUsers = rejectedUsers; }

    // Compatibility methods
    public BigDecimal getBudgetMin() { return budget; }
    public BigDecimal getBudgetMax() { return budget; }
    public User getPoster() { return null; }

    public static GigBuilder builder() { return new GigBuilder(); }

    public static class GigBuilder {
        private String gigId;
        private String title;
        private String description;
        private Category category;
        private Type type;
        private BigDecimal budget;
        private List<String> skillsRequired;
        private String postedBy;
        private Status status = Status.OPEN;
        private Instant createdAt = Instant.now();

        public GigBuilder gigId(String gigId) { this.gigId = gigId; return this; }
        public GigBuilder title(String title) { this.title = title; return this; }
        public GigBuilder description(String description) { this.description = description; return this; }
        public GigBuilder category(Category category) { this.category = category; return this; }
        public GigBuilder type(Type type) { this.type = type; return this; }
        public GigBuilder budget(BigDecimal budget) { this.budget = budget; return this; }
        public GigBuilder skillsRequired(List<String> skillsRequired) { this.skillsRequired = skillsRequired; return this; }
        public GigBuilder postedBy(String postedBy) { this.postedBy = postedBy; return this; }
        public GigBuilder status(Status status) { this.status = status; return this; }
        public GigBuilder createdAt(Instant createdAt) { this.createdAt = createdAt; return this; }

        public Gig build() {
            return new Gig(gigId, title, description, category, type, budget, skillsRequired, postedBy, status, createdAt);
        }
    }
}



