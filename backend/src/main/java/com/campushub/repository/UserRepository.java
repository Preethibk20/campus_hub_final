package com.campushub.repository;

import com.campushub.domain.User;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.mongodb.repository.Query;

import java.time.Instant;
import java.util.Optional;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface UserRepository extends MongoRepository<User, String> {
    Optional<User> findByEmail(String email);
    boolean existsByEmail(String email);

    @Query("{ '$and': [ { '$or': [ { 'name': { '$regex': ?0, '$options': 'i' } }, { 'email': { '$regex': ?0, '$options': 'i' } } ] }, { 'role': ?1 }, { 'is_verified': ?2 } ] }")
    Page<User> findAdminFiltered(String search, String role, Boolean isVerified, Pageable pageable);
    
    long countByCreatedAtAfter(Instant date);
}



