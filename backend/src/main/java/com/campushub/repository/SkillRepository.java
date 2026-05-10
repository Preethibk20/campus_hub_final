package com.campushub.repository;

import com.campushub.domain.Skill;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.List;

public interface SkillRepository extends MongoRepository<Skill, String> {
    List<Skill> findByUserIdAndIsActiveTrue(String userId);
}



