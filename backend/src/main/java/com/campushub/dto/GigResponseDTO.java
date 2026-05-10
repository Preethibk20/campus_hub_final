package com.campushub.dto;

import com.campushub.domain.Gig;
import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;

public class GigResponseDTO {
    private String id;
    private String title;
    private String description;
    private Gig.Category category;
    private Gig.Type type;
    private BigDecimal budget;
    private List<String> skillsRequired;
    private String postedBy;
    private Gig.Status status;
    private Instant createdAt;
    
    private String posterName;
    private String posterCollege;
    private String posterBranch;
    private String posterAcademicYear;
    private String posterProfilePic;
    private long applicationCount;
    private boolean hasApplied;

    public GigResponseDTO() {}

    public GigResponseDTO(String id, String title, String description, Gig.Category category, Gig.Type type, BigDecimal budget, List<String> skillsRequired, String postedBy, Gig.Status status, Instant createdAt, String posterName, String posterCollege, String posterBranch, String posterAcademicYear, String posterProfilePic, long applicationCount, boolean hasApplied) {
        this.id = id;
        this.title = title;
        this.description = description;
        this.category = category;
        this.type = type;
        this.budget = budget;
        this.skillsRequired = skillsRequired;
        this.postedBy = postedBy;
        this.status = status;
        this.createdAt = createdAt;
        this.posterName = posterName;
        this.posterCollege = posterCollege;
        this.posterBranch = posterBranch;
        this.posterAcademicYear = posterAcademicYear;
        this.posterProfilePic = posterProfilePic;
        this.applicationCount = applicationCount;
        this.hasApplied = hasApplied;
    }

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }
    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
    public Gig.Category getCategory() { return category; }
    public void setCategory(Gig.Category category) { this.category = category; }
    public Gig.Type getType() { return type; }
    public void setType(Gig.Type type) { this.type = type; }
    public BigDecimal getBudget() { return budget; }
    public void setBudget(BigDecimal budget) { this.budget = budget; }
    public List<String> getSkillsRequired() { return skillsRequired; }
    public void setSkillsRequired(List<String> skillsRequired) { this.skillsRequired = skillsRequired; }
    public String getPostedBy() { return postedBy; }
    public void setPostedBy(String postedBy) { this.postedBy = postedBy; }
    public Gig.Status getStatus() { return status; }
    public void setStatus(Gig.Status status) { this.status = status; }
    public Instant getCreatedAt() { return createdAt; }
    public void setCreatedAt(Instant createdAt) { this.createdAt = createdAt; }
    public String getPosterName() { return posterName; }
    public void setPosterName(String posterName) { this.posterName = posterName; }
    public String getPosterCollege() { return posterCollege; }
    public void setPosterCollege(String posterCollege) { this.posterCollege = posterCollege; }
    public String getPosterBranch() { return posterBranch; }
    public void setPosterBranch(String posterBranch) { this.posterBranch = posterBranch; }
    public String getPosterAcademicYear() { return posterAcademicYear; }
    public void setPosterAcademicYear(String posterAcademicYear) { this.posterAcademicYear = posterAcademicYear; }
    public String getPosterProfilePic() { return posterProfilePic; }
    public void setPosterProfilePic(String posterProfilePic) { this.posterProfilePic = posterProfilePic; }
    public long getApplicationCount() { return applicationCount; }
    public void setApplicationCount(long applicationCount) { this.applicationCount = applicationCount; }
    public boolean isHasApplied() { return hasApplied; }
    public void setHasApplied(boolean hasApplied) { this.hasApplied = hasApplied; }

    public static GigResponseDTOBuilder builder() { return new GigResponseDTOBuilder(); }

    public static class GigResponseDTOBuilder {
        private String id;
        private String title;
        private String description;
        private Gig.Category category;
        private Gig.Type type;
        private BigDecimal budget;
        private List<String> skillsRequired;
        private String postedBy;
        private Gig.Status status;
        private Instant createdAt;
        private String posterName;
        private String posterCollege;
        private String posterBranch;
        private String posterAcademicYear;
        private String posterProfilePic;
        private long applicationCount;
        private boolean hasApplied;

        public GigResponseDTOBuilder id(String id) { this.id = id; return this; }
        public GigResponseDTOBuilder title(String title) { this.title = title; return this; }
        public GigResponseDTOBuilder description(String description) { this.description = description; return this; }
        public GigResponseDTOBuilder category(Gig.Category category) { this.category = category; return this; }
        public GigResponseDTOBuilder type(Gig.Type type) { this.type = type; return this; }
        public GigResponseDTOBuilder budget(BigDecimal budget) { this.budget = budget; return this; }
        public GigResponseDTOBuilder skillsRequired(List<String> skillsRequired) { this.skillsRequired = skillsRequired; return this; }
        public GigResponseDTOBuilder postedBy(String postedBy) { this.postedBy = postedBy; return this; }
        public GigResponseDTOBuilder status(Gig.Status status) { this.status = status; return this; }
        public GigResponseDTOBuilder createdAt(Instant createdAt) { this.createdAt = createdAt; return this; }
        public GigResponseDTOBuilder posterName(String posterName) { this.posterName = posterName; return this; }
        public GigResponseDTOBuilder posterCollege(String posterCollege) { this.posterCollege = posterCollege; return this; }
        public GigResponseDTOBuilder posterBranch(String posterBranch) { this.posterBranch = posterBranch; return this; }
        public GigResponseDTOBuilder posterAcademicYear(String posterAcademicYear) { this.posterAcademicYear = posterAcademicYear; return this; }
        public GigResponseDTOBuilder posterProfilePic(String posterProfilePic) { this.posterProfilePic = posterProfilePic; return this; }
        public GigResponseDTOBuilder applicationCount(long applicationCount) { this.applicationCount = applicationCount; return this; }
        public GigResponseDTOBuilder hasApplied(boolean hasApplied) { this.hasApplied = hasApplied; return this; }

        public GigResponseDTO build() {
            return new GigResponseDTO(id, title, description, category, type, budget, skillsRequired, postedBy, status, createdAt, posterName, posterCollege, posterBranch, posterAcademicYear, posterProfilePic, applicationCount, hasApplied);
        }
    }
}



