package com.campushub.repository;

import com.campushub.domain.GigApplication;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.List;
import java.util.Optional;

public interface GigApplicationRepository extends MongoRepository<GigApplication, String> {
    List<GigApplication> findByGigId(String gigId);
    boolean existsByGigIdAndApplicantId(String gigId, String applicantId);
    Optional<GigApplication> findByGigIdAndApplicantId(String gigId, String applicantId);
}



