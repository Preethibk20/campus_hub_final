package com.campushub.repository;

import com.campushub.domain.HackathonPost;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.mongodb.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;


@Repository
public interface HackathonPostRepository extends MongoRepository<HackathonPost, String> {

    /** All posts by a specific user */
    List<HackathonPost> findByPostedBy(String userId);

    /** Filter by status (OPEN / CLOSED) */
    List<HackathonPost> findByStatus(HackathonPost.Status status);

    /** Filter by mode (ONLINE / OFFLINE / HYBRID) */
    List<HackathonPost> findByMode(HackathonPost.Mode mode);

    /** Filter by status AND mode */
    List<HackathonPost> findByStatusAndMode(HackathonPost.Status status, HackathonPost.Mode mode);

    /** Posts that still have open spots */
    @Query("{ 'status': 'OPEN', $expr: { $lt: ['$currentSize', '$teamSize'] } }")
    List<HackathonPost> findOpenWithAvailableSpots();

    /** Search by tech stack item (any of the provided list) */
    @Query("{ 'techStack': { $in: ?0 } }")
    List<HackathonPost> findByTechStackIn(List<String> tech);

    /** Posts that need a specific role (case-insensitive) */
    @Query("{ 'rolesNeeded': { $regex: ?0, $options: 'i' } }")
    List<HackathonPost> findByRoleNeeded(String role);
}



