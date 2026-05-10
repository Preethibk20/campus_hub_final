package com.campushub.repository;

import com.campushub.domain.RefreshToken;
import com.campushub.domain.User;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.Optional;


public interface RefreshTokenRepository extends MongoRepository<RefreshToken, String> {
    Optional<RefreshToken> findByToken(String token);
    void deleteByUserId(String userId);
}



