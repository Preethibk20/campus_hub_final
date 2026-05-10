package com.campushub.domain;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.mapping.Field;
import org.springframework.data.mongodb.core.mapping.DBRef;

import java.time.Instant;


@Document(collection = "endorsements")
public class Endorsement {

    @Id
    private String id;

    @DBRef
    private User endorser;

    @DBRef
    private User endorsee;

    @DBRef
    private Skill skill; // The service might expect a Skill object or ID

    @Field("skill_id")
    private String skillId; // To satisfy existsByEndorserIdAndSkillId

    private String comment;

    @Field("created_at")
    private Instant createdAt = Instant.now();

    public Endorsement() {}

    public Endorsement(String id, User endorser, User endorsee, Skill skill, String skillId, String comment, Instant createdAt) {
        this.id = id;
        this.endorser = endorser;
        this.endorsee = endorsee;
        this.skill = skill;
        this.skillId = skillId;
        this.comment = comment;
        this.createdAt = createdAt;
    }

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }
    public User getEndorser() { return endorser; }
    public void setEndorser(User endorser) { this.endorser = endorser; }
    public User getEndorsee() { return endorsee; }
    public void setEndorsee(User endorsee) { this.endorsee = endorsee; }
    public Skill getSkill() { return skill; }
    public void setSkill(Skill skill) { this.skill = skill; }
    public String getSkillId() { return skillId; }
    public void setSkillId(String skillId) { this.skillId = skillId; }
    public String getComment() { return comment; }
    public void setComment(String comment) { this.comment = comment; }
    public Instant getCreatedAt() { return createdAt; }
    public void setCreatedAt(Instant createdAt) { this.createdAt = createdAt; }

    public static EndorsementBuilder builder() { return new EndorsementBuilder(); }

    public static class EndorsementBuilder {
        private String id;
        private User endorser;
        private User endorsee;
        private Skill skill;
        private String skillId;
        private String comment;
        private Instant createdAt;

        public EndorsementBuilder id(String id) { this.id = id; return this; }
        public EndorsementBuilder endorser(User endorser) { this.endorser = endorser; return this; }
        public EndorsementBuilder endorsee(User endorsee) { this.endorsee = endorsee; return this; }
        public EndorsementBuilder skill(Skill skill) { this.skill = skill; return this; }
        public EndorsementBuilder skillId(String skillId) { this.skillId = skillId; return this; }
        public EndorsementBuilder comment(String comment) { this.comment = comment; return this; }
        public EndorsementBuilder createdAt(Instant createdAt) { this.createdAt = createdAt; return this; }

        public Endorsement build() {
            return new Endorsement(id, endorser, endorsee, skill, skillId, comment, createdAt);
        }
    }
}



