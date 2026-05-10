package com.campushub.repository;

import com.campushub.domain.Notification;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.mongodb.repository.MongoRepository;



public interface NotificationRepository extends MongoRepository<Notification, String> {

    Page<Notification> findByUserIdOrderByCreatedAtDesc(String userId, Pageable pageable);

    long countByUserIdAndIsReadFalse(String userId);

    default int markAllReadForUser(String userId) { return 0; }
}



