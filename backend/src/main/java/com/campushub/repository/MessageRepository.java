package com.campushub.repository;

import com.campushub.domain.Message;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.mongodb.repository.Query;

import java.util.List;
import java.time.Instant;

public interface MessageRepository extends MongoRepository<Message, String> {

    Page<Message> findByConversationIdOrderByCreatedAtAsc(String conversationId, Pageable pageable);

    default int markAllRead(String convId, String userId) { return 0; }

    @Query("{ 'conversationId': ?0, 'senderId': { '$ne': ?1 }, 'createdAt': { '$gt': ?2 } }")
    Page<Message> findMissedMessages(String convId, String userId, Instant since, Pageable pageable);

    @Query(value = "{ 'conversationId': ?0 }", sort = "{ 'createdAt': -1 }")
    List<Message> findLatestInConversation(String convId, Pageable pageable);

    @Query(value = "{ 'conversationId': ?0, 'senderId': { '$ne': ?1 }, 'isRead': false }", count = true)
    long countUnreadForUser(String convId, String userId);
}



