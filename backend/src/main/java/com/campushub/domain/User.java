package com.campushub.domain;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.mapping.Field;
import org.springframework.data.mongodb.core.mapping.DBRef;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.ArrayList;
import java.util.List;


@Document(collection = "users")
public class User {

    @Id
    private String id;

    private String email;

    private String name;

    private String password;

    private String role = "USER";

    private boolean isVerified = true;
    private boolean isBanned = false;

    private String bio;

    @Field("college")
    private String collegeId;

    private String branch;

    private String academicYear;

    private List<String> skills = new ArrayList<>();

    private String githubUrl;

    private String linkedinUrl;

    private String portfolioUrl;

    private String availability = "Open to Both";

    private Integer profileCompletion = 0;

    private String profilePicUrl;

    private BigDecimal rating = BigDecimal.ZERO;

    private Integer reviewCount = 0;

    private List<String> domains = new ArrayList<>();

    private BigDecimal hourlyRate;

    private Instant createdAt = Instant.now();

    public User() {}

    public User(String id, String email, String name, String password, String role, boolean isVerified, String bio, String collegeId, String branch, String academicYear, List<String> skills, String githubUrl, String linkedinUrl, String portfolioUrl, String availability, Integer profileCompletion, String profilePicUrl, BigDecimal rating, Integer reviewCount, Instant createdAt) {
        this.id = id;
        this.email = email;
        this.name = name;
        this.password = password;
        this.role = role;
        this.isVerified = isVerified;
        this.bio = bio;
        this.collegeId = collegeId;
        this.branch = branch;
        this.academicYear = academicYear;
        this.skills = skills;
        this.githubUrl = githubUrl;
        this.linkedinUrl = linkedinUrl;
        this.portfolioUrl = portfolioUrl;
        this.availability = availability;
        this.profileCompletion = profileCompletion;
        this.profilePicUrl = profilePicUrl;
        this.rating = rating;
        this.reviewCount = reviewCount;
        this.createdAt = createdAt;
    }

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }
    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    public String getPassword() { return password; }
    public void setPassword(String password) { this.password = password; }
    public String getRole() { return role; }
    public void setRole(String role) { this.role = role; }
    public boolean isVerified() { return isVerified; }
    public void setVerified(boolean verified) { isVerified = verified; }
    public boolean isBanned() { return isBanned; }
    public void setBanned(boolean banned) { isBanned = banned; }
    public String getBio() { return bio; }
    public void setBio(String bio) { this.bio = bio; }
    public String getCollegeId() { return collegeId; }
    public void setCollegeId(String collegeId) { this.collegeId = collegeId; }
    public String getBranch() { return branch; }
    public void setBranch(String branch) { this.branch = branch; }
    public String getAcademicYear() { return academicYear; }
    public void setAcademicYear(String academicYear) { this.academicYear = academicYear; }
    public List<String> getSkills() { return skills; }
    public void setSkills(List<String> skills) { this.skills = skills; }
    public String getGithubUrl() { return githubUrl; }
    public void setGithubUrl(String githubUrl) { this.githubUrl = githubUrl; }
    public String getLinkedinUrl() { return linkedinUrl; }
    public void setLinkedinUrl(String linkedinUrl) { this.linkedinUrl = linkedinUrl; }
    public String getPortfolioUrl() { return portfolioUrl; }
    public void setPortfolioUrl(String portfolioUrl) { this.portfolioUrl = portfolioUrl; }
    public String getAvailability() { return availability; }
    public void setAvailability(String availability) { this.availability = availability; }
    public Integer getProfileCompletion() { return profileCompletion; }
    public void setProfileCompletion(Integer profileCompletion) { this.profileCompletion = profileCompletion; }
    public String getProfilePicUrl() { return profilePicUrl; }
    public void setProfilePicUrl(String profilePicUrl) { this.profilePicUrl = profilePicUrl; }
    public BigDecimal getAvgRating() { return rating; }
    public void setAvgRating(BigDecimal rating) { this.rating = rating; }
    public Integer getReviewCount() { return reviewCount; }
    public void setReviewCount(Integer reviewCount) { this.reviewCount = reviewCount; }
    public Instant getCreatedAt() { return createdAt; }
    public void setCreatedAt(Instant createdAt) { this.createdAt = createdAt; }

    public List<String> getDomains() { return domains; }
    public void setDomains(List<String> domains) { this.domains = domains; }

    public BigDecimal getHourlyRate() { return hourlyRate; }
    public void setHourlyRate(BigDecimal hourlyRate) { this.hourlyRate = hourlyRate; }

    public String getYear() { return academicYear; }
    public void setYear(String year) { this.academicYear = year; }

    public String getCourse() { return branch; }
    public void setCourse(String course) { this.branch = course; }

    public static UserBuilder builder() { return new UserBuilder(); }

    public static class UserBuilder {
        private String id;
        private String email;
        private String name;
        private String password;
        private String role = "USER";
        private boolean isVerified = true;
    private boolean isBanned = false;
        private String bio;
        private String collegeId;
        private String branch;
        private String academicYear;
        private List<String> skills = new ArrayList<>();
        private String githubUrl;
        private String linkedinUrl;
        private String portfolioUrl;
        private String availability = "Open to Both";
        private Integer profileCompletion = 0;
        private String profilePicUrl;
        private BigDecimal rating = BigDecimal.ZERO;
        private Integer reviewCount = 0;
        private Instant createdAt;

        public UserBuilder id(String id) { this.id = id; return this; }
        public UserBuilder email(String email) { this.email = email; return this; }
        public UserBuilder name(String name) { this.name = name; return this; }
        public UserBuilder password(String password) { this.password = password; return this; }
        public UserBuilder role(String role) { this.role = role; return this; }
        public UserBuilder isVerified(boolean isVerified) { this.isVerified = isVerified; return this; }
        public UserBuilder bio(String bio) { this.bio = bio; return this; }
        public UserBuilder collegeId(String collegeId) { this.collegeId = collegeId; return this; }
        public UserBuilder branch(String branch) { this.branch = branch; return this; }
        public UserBuilder academicYear(String academicYear) { this.academicYear = academicYear; return this; }
        public UserBuilder skills(List<String> skills) { this.skills = skills; return this; }
        public UserBuilder githubUrl(String githubUrl) { this.githubUrl = githubUrl; return this; }
        public UserBuilder linkedinUrl(String linkedinUrl) { this.linkedinUrl = linkedinUrl; return this; }
        public UserBuilder portfolioUrl(String portfolioUrl) { this.portfolioUrl = portfolioUrl; return this; }
        public UserBuilder availability(String availability) { this.availability = availability; return this; }
        public UserBuilder profileCompletion(Integer profileCompletion) { this.profileCompletion = profileCompletion; return this; }
        public UserBuilder profilePicUrl(String profilePicUrl) { this.profilePicUrl = profilePicUrl; return this; }
        public UserBuilder rating(BigDecimal rating) { this.rating = rating; return this; }
        public UserBuilder reviewCount(Integer reviewCount) { this.reviewCount = reviewCount; return this; }
        public UserBuilder createdAt(Instant createdAt) { this.createdAt = createdAt; return this; }
        public UserBuilder isBanned(boolean isBanned) { this.isBanned = isBanned; return this; }

        public User build() {
            User user = new User(id, email, name, password, role, isVerified, bio, collegeId, branch, academicYear, skills, githubUrl, linkedinUrl, portfolioUrl, availability, profileCompletion, profilePicUrl, rating, reviewCount, createdAt);
            user.setBanned(isBanned);
            return user;
        }
    }
}





