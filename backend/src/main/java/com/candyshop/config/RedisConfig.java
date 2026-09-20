package com.candyshop.config;

import com.fasterxml.jackson.annotation.JsonTypeInfo;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.jsontype.impl.LaissezFaireSubTypeValidator;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.cache.CacheManager;
import org.springframework.cache.annotation.EnableCaching;
import org.springframework.cache.concurrent.ConcurrentMapCacheManager;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Primary;
import org.springframework.data.redis.cache.RedisCacheConfiguration;
import org.springframework.data.redis.cache.RedisCacheManager;
import org.springframework.data.redis.connection.RedisConnectionFactory;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.data.redis.serializer.GenericJackson2JsonRedisSerializer;
import org.springframework.data.redis.serializer.RedisSerializationContext;
import org.springframework.data.redis.serializer.StringRedisSerializer;

import java.time.Duration;
import java.util.HashMap;
import java.util.Map;

/**
 * Enterprise Caching and Redis Configuration.
 * Provides resilient CacheManager with graceful in-memory fallback when Redis is offline.
 */
@Configuration
@EnableCaching
public class RedisConfig {

    private static final Logger log = LoggerFactory.getLogger(RedisConfig.class);

    @Value("${spring.cache.type:simple}")
    private String cacheType;

    /**
     * Primary CacheManager: Uses Redis when spring.cache.type=redis,
     * otherwise provides ultra-fast in-memory ConcurrentMapCacheManager.
     */
    @Bean
    @Primary
    public CacheManager cacheManager(RedisConnectionFactory connectionFactory) {
        if ("redis".equalsIgnoreCase(cacheType)) {
            try {
                log.info("Initializing RedisCacheManager with customized TTLs and Jackson serializer...");
                ObjectMapper objectMapper = new ObjectMapper();
                objectMapper.registerModule(new JavaTimeModule());
                objectMapper.activateDefaultTyping(
                        LaissezFaireSubTypeValidator.instance,
                        ObjectMapper.DefaultTyping.NON_FINAL,
                        JsonTypeInfo.As.PROPERTY
                );

                GenericJackson2JsonRedisSerializer serializer = new GenericJackson2JsonRedisSerializer(objectMapper);

                RedisCacheConfiguration defaultConfig = RedisCacheConfiguration.defaultCacheConfig()
                        .entryTtl(Duration.ofHours(1))
                        .disableCachingNullValues()
                        .serializeKeysWith(RedisSerializationContext.SerializationPair.fromSerializer(new StringRedisSerializer()))
                        .serializeValuesWith(RedisSerializationContext.SerializationPair.fromSerializer(serializer));

                // Dedicated TTL policies per domain
                Map<String, RedisCacheConfiguration> cacheConfigurations = new HashMap<>();
                cacheConfigurations.put("categories", defaultConfig.entryTtl(Duration.ofHours(12)));
                cacheConfigurations.put("banners", defaultConfig.entryTtl(Duration.ofHours(6)));
                cacheConfigurations.put("settings", defaultConfig.entryTtl(Duration.ofHours(24)));
                cacheConfigurations.put("products", defaultConfig.entryTtl(Duration.ofHours(1)));

                return RedisCacheManager.builder(connectionFactory)
                        .cacheDefaults(defaultConfig)
                        .withInitialCacheConfigurations(cacheConfigurations)
                        .build();
            } catch (Exception e) {
                log.warn("Failed to initialize RedisCacheManager. Falling back to in-memory cache: {}", e.getMessage());
            }
        }

        log.info("Using in-memory ConcurrentMapCacheManager (spring.cache.type={})", cacheType);
        return new ConcurrentMapCacheManager("categories", "banners", "settings", "products");
    }

    /**
     * StringRedisTemplate for atomic sequence counters and distributed locks.
     * Only created when Redis cache is actually enabled (spring.cache.type=redis).
     * When deploying without Redis (cache.type=simple), this bean is skipped entirely.
     */
    @Bean
    @ConditionalOnProperty(name = "spring.cache.type", havingValue = "redis")
    public StringRedisTemplate stringRedisTemplate(RedisConnectionFactory connectionFactory) {
        return new StringRedisTemplate(connectionFactory);
    }
}
