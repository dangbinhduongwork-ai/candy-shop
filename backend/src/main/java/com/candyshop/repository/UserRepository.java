package com.candyshop.repository;

import com.candyshop.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

/**
 * Repository for User entity — provides DB access layer.
 */
@Repository
public interface UserRepository extends JpaRepository<User, Long> {

    /** Find user by email (used for login and duplicate check) */
    Optional<User> findByEmail(String email);

    /** Check if an email is already taken */
    boolean existsByEmail(String email);
}
