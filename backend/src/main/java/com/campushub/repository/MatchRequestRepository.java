package com.campushub.repository;

import com.campushub.domain.MatchRequest;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;


@Repository
public interface MatchRequestRepository extends MongoRepository<MatchRequest, String> {

    /** All requests received by a post owner */
    List<MatchRequest> findByToUserId(String toUserId);

    /** All requests sent by a user */
    List<MatchRequest> findByFromUserId(String fromUserId);

    /** All requests for a specific post (owner view) */
    List<MatchRequest> findByPostId(String postId);

    /** All requests for a post filtered by status */
    List<MatchRequest> findByPostIdAndStatus(String postId, MatchRequest.Status status);

    /** Check whether a user has already sent a request to this post — for duplicate prevention */
    Optional<MatchRequest> findByPostIdAndFromUserId(String postId, String fromUserId);

    /** All pending incoming requests for a user */
    List<MatchRequest> findByToUserIdAndStatus(String toUserId, MatchRequest.Status status);

    /** All outgoing requests for a user filtered by status */
    List<MatchRequest> findByFromUserIdAndStatus(String fromUserId, MatchRequest.Status status);
}



