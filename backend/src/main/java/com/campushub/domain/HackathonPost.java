package com.campushub.domain;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.mapping.Field;
import org.springframework.data.mongodb.core.mapping.DBRef;

import java.time.Instant;

import java.util.List;
import java.util.ArrayList;

@Document(collection = "hackathon_posts")
public class HackathonPost {

    public enum Status { OPEN, CLOSED }
    public enum Mode   { ONLINE, OFFLINE, HYBRID }

    @Id
    private String id;

    @DBRef
    private User poster;

    private String postedBy;

    private String title;

    private String description;

    private String hackathonName;

    private Integer teamSize;

    private Integer currentSize = 1;

    private List<String> roles;

    private List<String> techStack = new ArrayList<>();

    private List<String> rolesNeeded = new ArrayList<>();

    private Status status = Status.OPEN;

    private Mode mode = Mode.ONLINE;

    private boolean isActive = true;

    private Instant createdAt = Instant.now();

    public HackathonPost() {}

    public HackathonPost(String id, User poster, String postedBy, String title, String description, String hackathonName, Integer teamSize, Integer currentSize, List<String> roles, List<String> techStack, List<String> rolesNeeded, Status status, Mode mode, boolean isActive, Instant createdAt) {
        this.id = id;
        this.poster = poster;
        this.postedBy = postedBy;
        this.title = title;
        this.description = description;
        this.hackathonName = hackathonName;
        this.teamSize = teamSize;
        this.currentSize = currentSize;
        this.roles = roles;
        this.techStack = techStack;
        this.rolesNeeded = rolesNeeded;
        this.status = status;
        this.mode = mode;
        this.isActive = isActive;
        this.createdAt = createdAt;
    }

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }
    
    public String getPostId() { return id; }
    public void setPostId(String id) { this.id = id; }
    
    public boolean hasOpenSpots() {
        return currentSize < teamSize && status == Status.OPEN;
    }

    public User getPoster() { return poster; }
    public void setPoster(User poster) { this.poster = poster; }
    public String getPostedBy() { return postedBy; }
    public void setPostedBy(String postedBy) { this.postedBy = postedBy; }
    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
    public String getHackathonName() { return hackathonName; }
    public void setHackathonName(String hackathonName) { this.hackathonName = hackathonName; }
    public Integer getTeamSize() { return teamSize; }
    public void setTeamSize(Integer teamSize) { this.teamSize = teamSize; }
    public Integer getCurrentSize() { return currentSize; }
    public void setCurrentSize(Integer currentSize) { this.currentSize = currentSize; }
    public List<String> getRoles() { return roles; }
    public void setRoles(List<String> roles) { this.roles = roles; }
    public List<String> getTechStack() { return techStack; }
    public void setTechStack(List<String> techStack) { this.techStack = techStack; }
    public List<String> getRolesNeeded() { return rolesNeeded; }
    public void setRolesNeeded(List<String> rolesNeeded) { this.rolesNeeded = rolesNeeded; }
    public Status getStatus() { return status; }
    public void setStatus(Status status) { this.status = status; }
    public Mode getMode() { return mode; }
    public void setMode(Mode mode) { this.mode = mode; }
    public boolean isActive() { return isActive; }
    public void setActive(boolean active) { isActive = active; }
    public Instant getCreatedAt() { return createdAt; }
    public void setCreatedAt(Instant createdAt) { this.createdAt = createdAt; }

    public static HackathonPostBuilder builder() { return new HackathonPostBuilder(); }

    public static class HackathonPostBuilder {
        private String id;
        private User poster;
        private String postedBy;
        private String title;
        private String description;
        private String hackathonName;
        private Integer teamSize;
        private Integer currentSize = 1;
        private List<String> roles;
        private List<String> techStack = new ArrayList<>();
        private List<String> rolesNeeded = new ArrayList<>();
        private Status status = Status.OPEN;
        private Mode mode = Mode.ONLINE;
        private boolean isActive = true;
        private Instant createdAt;

        public HackathonPostBuilder id(String id) { this.id = id; return this; }
        public HackathonPostBuilder poster(User poster) { this.poster = poster; return this; }
        public HackathonPostBuilder postedBy(String postedBy) { this.postedBy = postedBy; return this; }
        public HackathonPostBuilder title(String title) { this.title = title; return this; }
        public HackathonPostBuilder description(String description) { this.description = description; return this; }
        public HackathonPostBuilder hackathonName(String hackathonName) { this.hackathonName = hackathonName; return this; }
        public HackathonPostBuilder teamSize(Integer teamSize) { this.teamSize = teamSize; return this; }
        public HackathonPostBuilder currentSize(Integer currentSize) { this.currentSize = currentSize; return this; }
        public HackathonPostBuilder roles(List<String> roles) { this.roles = roles; return this; }
        public HackathonPostBuilder techStack(List<String> techStack) { this.techStack = techStack; return this; }
        public HackathonPostBuilder rolesNeeded(List<String> rolesNeeded) { this.rolesNeeded = rolesNeeded; return this; }
        public HackathonPostBuilder status(Status status) { this.status = status; return this; }
        public HackathonPostBuilder mode(Mode mode) { this.mode = mode; return this; }
        public HackathonPostBuilder isActive(boolean isActive) { this.isActive = isActive; return this; }
        public HackathonPostBuilder createdAt(Instant createdAt) { this.createdAt = createdAt; return this; }

        public HackathonPost build() {
            return new HackathonPost(id, poster, postedBy, title, description, hackathonName, teamSize, currentSize, roles, techStack, rolesNeeded, status, mode, isActive, createdAt);
        }
    }
}



