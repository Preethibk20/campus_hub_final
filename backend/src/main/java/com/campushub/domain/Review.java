package com.campushub.domain;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.mapping.Field;
import org.springframework.data.mongodb.core.mapping.DBRef;

import java.time.Instant;


@Document(collection = "reviews")
public class Review {

    @Id
    private String id;

    @DBRef
    private Order order;

    @DBRef
    private User reviewer;

    @DBRef
    private User reviewee;

    private Short rating;

    private String comment;

    private Instant createdAt = Instant.now();

    public Review() {}

    public Review(String id, Order order, User reviewer, User reviewee, Short rating, String comment, Instant createdAt) {
        this.id = id;
        this.order = order;
        this.reviewer = reviewer;
        this.reviewee = reviewee;
        this.rating = rating;
        this.comment = comment;
        this.createdAt = createdAt;
    }

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }
    public Order getOrder() { return order; }
    public void setOrder(Order order) { this.order = order; }
    public User getReviewer() { return reviewer; }
    public void setReviewer(User reviewer) { this.reviewer = reviewer; }
    public User getReviewee() { return reviewee; }
    public void setReviewee(User reviewee) { this.reviewee = reviewee; }
    public Short getRating() { return rating; }
    public void setRating(Short rating) { this.rating = rating; }
    public String getComment() { return comment; }
    public void setComment(String comment) { this.comment = comment; }
    public Instant getCreatedAt() { return createdAt; }
    public void setCreatedAt(Instant createdAt) { this.createdAt = createdAt; }

    public static ReviewBuilder builder() { return new ReviewBuilder(); }

    public static class ReviewBuilder {
        private String id;
        private Order order;
        private User reviewer;
        private User reviewee;
        private Short rating;
        private String comment;
        private Instant createdAt;

        public ReviewBuilder id(String id) { this.id = id; return this; }
        public ReviewBuilder order(Order order) { this.order = order; return this; }
        public ReviewBuilder reviewer(User reviewer) { this.reviewer = reviewer; return this; }
        public ReviewBuilder reviewee(User reviewee) { this.reviewee = reviewee; return this; }
        public ReviewBuilder rating(Short rating) { this.rating = rating; return this; }
        public ReviewBuilder comment(String comment) { this.comment = comment; return this; }
        public ReviewBuilder createdAt(Instant createdAt) { this.createdAt = createdAt; return this; }

        public Review build() {
            return new Review(id, order, reviewer, reviewee, rating, comment, createdAt);
        }
    }
}



