package com.campushub.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.data.auditing.DateTimeProvider;
import org.springframework.data.mongodb.config.EnableMongoAuditing;

import java.time.Instant;
import java.util.Optional;

/**
 * Enables Spring Data MongoDB auditing so that @LastModifiedDate
 * automatically populates fields on every save.
 */
@Configuration
@EnableMongoAuditing(dateTimeProviderRef = "instantProvider")
public class AuditConfig {

    @Bean
    public DateTimeProvider instantProvider() {
        return () -> Optional.of(Instant.now());
    }
}


