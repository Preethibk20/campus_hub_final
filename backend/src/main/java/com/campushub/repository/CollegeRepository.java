package com.campushub.repository;

import com.campushub.domain.College;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.Optional;

public interface CollegeRepository extends MongoRepository<College, String> {
    Optional<College> findByEmailDomain(String emailDomain);
}
