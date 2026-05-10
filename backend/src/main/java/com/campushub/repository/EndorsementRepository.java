package com.campushub.repository;

import com.campushub.domain.Endorsement;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.List;


public interface EndorsementRepository extends MongoRepository<Endorsement, String> {
    List<Endorsement> findByEndorseeId(String endorseeId);
    boolean existsByEndorserIdAndSkillId(String endorserId, String skillId);
}



