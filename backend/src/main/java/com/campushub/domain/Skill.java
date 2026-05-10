package com.campushub.domain;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.mapping.Field;
import org.springframework.data.mongodb.core.mapping.DBRef;

import java.math.BigDecimal;


@Document(collection = "skills")
public class Skill {

    public enum RateType { HOURLY, FIXED }

    @Id
    private String id;

    @DBRef
    private User user;

    private String name;

    private String category;

    @Field("rate_type")
    private RateType rateType;

    @Field("rate_amount")
    private BigDecimal rateAmount;

    @Field("is_active")
    private boolean isActive = true;

    public Skill() {}

    public Skill(String id, User user, String name, String category, RateType rateType, BigDecimal rateAmount, boolean isActive) {
        this.id = id;
        this.user = user;
        this.name = name;
        this.category = category;
        this.rateType = rateType;
        this.rateAmount = rateAmount;
        this.isActive = isActive;
    }

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }
    public User getUser() { return user; }
    public void setUser(User user) { this.user = user; }
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    public String getCategory() { return category; }
    public void setCategory(String category) { this.category = category; }
    public RateType getRateType() { return rateType; }
    public void setRateType(RateType rateType) { this.rateType = rateType; }
    public BigDecimal getRateAmount() { return rateAmount; }
    public void setRateAmount(BigDecimal rateAmount) { this.rateAmount = rateAmount; }
    public boolean isActive() { return isActive; }
    public void setActive(boolean active) { isActive = active; }

    public static SkillBuilder builder() { return new SkillBuilder(); }

    public static class SkillBuilder {
        private String id;
        private User user;
        private String name;
        private String category;
        private RateType rateType;
        private BigDecimal rateAmount;
        private boolean isActive = true;

        public SkillBuilder id(String id) { this.id = id; return this; }
        public SkillBuilder user(User user) { this.user = user; return this; }
        public SkillBuilder name(String name) { this.name = name; return this; }
        public SkillBuilder category(String category) { this.category = category; return this; }
        public SkillBuilder rateType(RateType rateType) { this.rateType = rateType; return this; }
        public SkillBuilder rateAmount(BigDecimal rateAmount) { this.rateAmount = rateAmount; return this; }
        public SkillBuilder isActive(boolean isActive) { this.isActive = isActive; return this; }

        public Skill build() {
            return new Skill(id, user, name, category, rateType, rateAmount, isActive);
        }
    }
}



