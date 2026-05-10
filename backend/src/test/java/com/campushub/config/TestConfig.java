package com.campushub.config;

import com.campushub.storage.StorageService;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.boot.test.context.TestConfiguration;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Primary;
import org.springframework.data.redis.connection.RedisConnectionFactory;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.web.multipart.MultipartFile;

import static org.mockito.Mockito.mock;

@TestConfiguration
public class TestConfig {

    /** Mock StorageService for storage.provider=mock */
    @Bean
    @Primary
    @ConditionalOnProperty(name = "storage.provider", havingValue = "mock")
    public StorageService mockStorageService() {
        return new StorageService() {
            @Override
            public String upload(MultipartFile file, String folder) {
                return "http://mock-storage/" + folder + "/" + file.getOriginalFilename();
            }
            @Override
            public void delete(String fileUrl) { /* no-op */ }
        };
    }

    /** Mock Redis so tests don't need a real Redis instance */
    @Bean
    @Primary
    public RedisConnectionFactory redisConnectionFactory() {
        return mock(RedisConnectionFactory.class);
    }

    @Bean
    @Primary
    public RedisTemplate<String, Object> redisTemplate(RedisConnectionFactory factory) {
        RedisTemplate<String, Object> template = mock(RedisTemplate.class);
        return template;
    }
}
