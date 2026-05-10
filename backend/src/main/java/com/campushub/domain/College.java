package com.campushub.domain;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.mapping.Field;



@Document(collection = "colleges")
public class College {

    @Id
    private String id;

    private String name;

    @Field("email_domain")
    private String emailDomain;

    @Field("is_active")
    private boolean isActive = true;

    public College() {}

    public College(String id, String name, String emailDomain, boolean isActive) {
        this.id = id;
        this.name = name;
        this.emailDomain = emailDomain;
        this.isActive = isActive;
    }

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    public String getEmailDomain() { return emailDomain; }
    public void setEmailDomain(String emailDomain) { this.emailDomain = emailDomain; }
    public boolean isActive() { return isActive; }
    public void setActive(boolean active) { isActive = active; }

    public static CollegeBuilder builder() {
        return new CollegeBuilder();
    }

    public static class CollegeBuilder {
        private String id;
        private String name;
        private String emailDomain;
        private boolean isActive = true;

        public CollegeBuilder id(String id) { this.id = id; return this; }
        public CollegeBuilder name(String name) { this.name = name; return this; }
        public CollegeBuilder emailDomain(String emailDomain) { this.emailDomain = emailDomain; return this; }
        public CollegeBuilder isActive(boolean isActive) { this.isActive = isActive; return this; }

        public College build() {
            return new College(id, name, emailDomain, isActive);
        }
    }
}



