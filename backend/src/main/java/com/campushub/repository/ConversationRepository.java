package com.campushub.repository;

import com.campushub.domain.Conversation;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.mongodb.repository.Query;

import java.util.List;
import java.util.Optional;

public interface ConversationRepository extends MongoRepository<Conversation, String> {

    @Query("{ '$or': [ { 'participantA': ?0 }, { 'participantB': ?0 } ] }")
    List<Conversation> findByParticipant(String userId);

    default List<Conversation> findByParticipantSortedByLatestMessage(String userId) {
        return findByParticipant(userId);
    }

    @Query("{ '$or': [ { 'participantA': ?0 }, { 'participantB': ?1 } ], '$or': [ { 'participantA': ?1 }, { 'participantB': ?0 } ] }")
    Optional<Conversation> findBetween(String a, String b);

    @Query("{ 'gigId': ?0, '$or': [ { 'participantA': ?1, 'participantB': ?2 }, { 'participantA': ?2, 'participantB': ?1 } ] }")
    Optional<Conversation> findByGigAndParticipants(String gigId, String a, String b);
}



