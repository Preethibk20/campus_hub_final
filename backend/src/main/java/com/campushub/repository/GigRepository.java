package com.campushub.repository;

import com.campushub.domain.Gig;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.mongodb.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;


@Repository
public interface GigRepository extends MongoRepository<Gig, String> {
    Page<Gig> findByPostedBy(String postedBy, Pageable pageable);
    List<Gig> findByPostedBy(String postedBy);
    List<Gig> findByCategory(Gig.Category category);
    List<Gig> findByType(Gig.Type type);
    List<Gig> findByStatus(Gig.Status status);
    long countByStatus(Gig.Status status);

    @Query("{ '$and': [ { ?0: { '$exists': true } }, { (:status IS NULL OR 'status' : :status) }, { (:category IS NULL OR 'category' : :category) } ] }")
    Page<Gig> findAdminFiltered(String status, String category, Pageable pageable);
}



