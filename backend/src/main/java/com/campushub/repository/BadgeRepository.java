package com.campushub.repository;

import com.campushub.domain.Badge;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.List;

public interface BadgeRepository extends MongoRepository<Badge, String> {
    List<Badge> findByUserId(String userId);
    boolean existsByUserIdAndBadgeKey(String userId, String badgeKey);
}



