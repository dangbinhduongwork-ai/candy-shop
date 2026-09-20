package com.candyshop.config;

import org.flywaydb.core.Flyway;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.boot.autoconfigure.flyway.FlywayMigrationStrategy;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

/**
 * Custom Flyway migration strategy that performs repair before migrate.
 * This automatically cleans up any failed migration attempts and aligns checksums,
 * preventing 'Validate failed: Detected failed migration' deployment blocks.
 */
@Configuration
@ConditionalOnProperty(name = "spring.flyway.enabled", havingValue = "true")
public class FlywayConfig {

    private static final Logger log = LoggerFactory.getLogger(FlywayConfig.class);

    @Bean
    public FlywayMigrationStrategy repairAndMigrateStrategy() {
        return flyway -> {
            log.info("Running Flyway repair to clean up any failed migrations...");
            flyway.repair();
            log.info("Running Flyway migrate...");
            flyway.migrate();
        };
    }
}
