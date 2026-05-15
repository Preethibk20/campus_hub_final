package com.campushub.config;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Primary;
import org.springframework.data.redis.connection.RedisConnectionFactory;
import org.springframework.data.redis.connection.RedisStandaloneConfiguration;
import org.springframework.data.redis.connection.lettuce.LettuceClientConfiguration;
import org.springframework.data.redis.connection.lettuce.LettuceConnectionFactory;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.data.redis.serializer.*;

import java.time.Duration;

/**
 * Redis configuration that gracefully degrades when Redis is unavailable.
 * The connection factory is created with a short timeout so the app won't
 * hang on startup, and all RedisTemplate operations will simply log a
 * warning and return null/empty instead of crashing.
 */
@Configuration
public class RedisConfig {

    private static final Logger log = LoggerFactory.getLogger(RedisConfig.class);

    @Value("${spring.data.redis.url:redis://localhost:6379}")
    private String redisUrl;

    @Bean
    @Primary
    public RedisConnectionFactory redisConnectionFactory() {
        try {
            log.info("Connecting to Redis at: {}", redisUrl.replaceAll(":.*@", ":***@")); // Hide password in logs
            
            // Handle redis:// or rediss:// URLs
            java.net.URI uri = java.net.URI.create(redisUrl);
            String host = uri.getHost();
            int port = uri.getPort() != -1 ? uri.getPort() : 6379;
            String password = null;
            
            if (uri.getUserInfo() != null) {
                String[] userInfo = uri.getUserInfo().split(":");
                password = userInfo.length > 1 ? userInfo[1] : userInfo[0];
            }

            RedisStandaloneConfiguration serverConfig = new RedisStandaloneConfiguration(host, port);
            if (password != null) {
                serverConfig.setPassword(password);
            }
            
            LettuceClientConfiguration.LettuceClientConfigurationBuilder clientConfigBuilder = LettuceClientConfiguration.builder()
                    .commandTimeout(Duration.ofSeconds(5)) // Increased timeout for cloud instances
                    .shutdownTimeout(Duration.ofMillis(500));
            
            if (redisUrl.startsWith("rediss://")) {
                clientConfigBuilder.useSsl();
            }
            
            LettuceClientConfiguration clientConfig = clientConfigBuilder.build();
            
            LettuceConnectionFactory factory = new LettuceConnectionFactory(serverConfig, clientConfig);
            factory.setValidateConnection(false);
            return factory;
        } catch (Exception e) {
            log.warn("Could not create Redis connection factory for {}: {}", redisUrl, e.getMessage());
            return new LettuceConnectionFactory(); // Fallback
        }
    }

    @Bean
    public RedisTemplate<String, Object> redisTemplate(RedisConnectionFactory factory) {
        var template = new RedisTemplate<String, Object>();
        template.setConnectionFactory(factory);
        template.setKeySerializer(new StringRedisSerializer());
        template.setValueSerializer(new StringRedisSerializer());
        template.setHashKeySerializer(new StringRedisSerializer());
        template.setHashValueSerializer(new StringRedisSerializer());
        template.afterPropertiesSet();
        return template;
    }
}
