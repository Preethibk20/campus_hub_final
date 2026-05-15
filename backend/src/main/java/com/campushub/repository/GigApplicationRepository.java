package com.campushub.repository;

import com.campushub.domain.GigApplication;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.List;
import java.util.Optional;

public interface GigApplicationRepository extends MongoRepository<GigApplication, String> {
    @org.springframework.data.mongodb.repository.Query("{$or: [{'gig_id': ?0}, {'gig.$id': ?0}]}")
    List<GigApplication> findByGigId(String gigId);

    @org.springframework.data.mongodb.repository.Query("{$or: [{'applicant_id': ?0}, {'applicant.$id': ?0}]}")
    List<GigApplication> findByApplicantId(String applicantId);

    @org.springframework.data.mongodb.repository.Query(value = "{$or: [{'gig_id': ?0, 'applicant_id': ?1}, {'gig.$id': ?0, 'applicant.$id': ?1}]}", exists = true)
    boolean existsByGigIdAndApplicantId(String gigId, String applicantId);

    @org.springframework.data.mongodb.repository.Query("{$or: [{'gig_id': ?0, 'applicant_id': ?1}, {'gig.$id': ?0, 'applicant.$id': ?1}]}")
    Optional<GigApplication> findByGigIdAndApplicantId(String gigId, String applicantId);
}



