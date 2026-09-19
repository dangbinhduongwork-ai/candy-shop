package com.candyshop.repository;

import com.candyshop.entity.Role;
import com.candyshop.entity.User;
import com.candyshop.entity.UserStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.Optional;

/**
 * Repository for User entity — provides DB access layer.
 */
@Repository
public interface UserRepository extends JpaRepository<User, Long> {

    /** Find user by email (used for login and duplicate check) */
    Optional<User> findByEmail(String email);

    /** Find user by reset password token */
    Optional<User> findByResetPasswordToken(String resetPasswordToken);

    /** Check if an email is already taken */
    boolean existsByEmail(String email);

    /** Find customer by ID and role USER */
    Optional<User> findByIdAndRole(Long id, Role role);

    /** Find all customers (ROLE_USER only) with search keyword and status filter */
    @Query("SELECT u FROM User u WHERE u.role = com.candyshop.entity.Role.ROLE_USER " +
           "AND (:status IS NULL OR u.status = :status) " +
           "AND (:search IS NULL OR LOWER(u.fullName) LIKE LOWER(CONCAT('%', :search, '%')) " +
           "     OR LOWER(u.email) LIKE LOWER(CONCAT('%', :search, '%')) " +
           "     OR u.phone LIKE CONCAT('%', :search, '%'))")
    Page<User> findCustomersWithFilter(
            @Param("status") UserStatus status,
            @Param("search") String search,
            Pageable pageable);

    /** Total customer count (ROLE_USER only) */
    long countByRole(Role role);

    /** Count customers by role and status */
    long countByRoleAndStatus(Role role, UserStatus status);

    /** Count new customers created after a specific date */
    long countByRoleAndCreatedAtGreaterThanEqual(Role role, LocalDateTime startDate);
}

