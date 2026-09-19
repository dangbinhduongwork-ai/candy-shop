package com.candyshop.repository;

import com.candyshop.entity.Order;
import com.candyshop.entity.OrderStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface OrderRepository extends JpaRepository<Order, Long> {

    @org.springframework.data.jpa.repository.EntityGraph(attributePaths = {"user", "items", "items.product"})
    Page<Order> findByUserEmailOrderByCreatedAtDesc(String email, Pageable pageable);

    @org.springframework.data.jpa.repository.EntityGraph(attributePaths = {"user", "items", "items.product"})
    Optional<Order> findByIdAndUserEmail(Long id, String email);

    @org.springframework.data.jpa.repository.EntityGraph(attributePaths = {"user", "items", "items.product"})
    Optional<Order> findByOrderCode(String orderCode);

    boolean existsByOrderCode(String orderCode);

    @org.springframework.data.jpa.repository.EntityGraph(attributePaths = {"user"})
    @Query(value = "SELECT o FROM Order o LEFT JOIN FETCH o.user WHERE " +
           "(:status IS NULL OR o.status = :status) AND " +
           "(:startDate IS NULL OR o.createdAt >= :startDate) AND " +
           "(:endDate IS NULL OR o.createdAt <= :endDate) AND " +
           "(:search IS NULL OR LOWER(o.orderCode) LIKE LOWER(CONCAT('%', :search, '%')) OR o.receiverPhone LIKE CONCAT('%', :search, '%'))",
           countQuery = "SELECT COUNT(o) FROM Order o WHERE " +
           "(:status IS NULL OR o.status = :status) AND " +
           "(:startDate IS NULL OR o.createdAt >= :startDate) AND " +
           "(:endDate IS NULL OR o.createdAt <= :endDate) AND " +
           "(:search IS NULL OR LOWER(o.orderCode) LIKE LOWER(CONCAT('%', :search, '%')) OR o.receiverPhone LIKE CONCAT('%', :search, '%'))")
    Page<Order> findAllWithFilter(
            @Param("status") OrderStatus status,
            @Param("startDate") LocalDateTime startDate,
            @Param("endDate") LocalDateTime endDate,
            @Param("search") String search,
            Pageable pageable);

    @Query("SELECT COALESCE(SUM(o.totalAmount), 0) FROM Order o WHERE o.status = com.candyshop.entity.OrderStatus.COMPLETED")
    BigDecimal sumCompletedRevenue();

    @Query("SELECT o.status, COUNT(o) FROM Order o GROUP BY o.status")
    List<Object[]> countOrdersByStatus();

    @Query("SELECT COUNT(oi) > 0 FROM OrderItem oi " +
           "WHERE oi.product.id = :productId " +
           "AND oi.order.user.email = :email " +
           "AND oi.order.status = com.candyshop.entity.OrderStatus.COMPLETED")
    boolean hasUserPurchasedCompletedProduct(@Param("productId") Long productId, @Param("email") String email);

    /** Count total orders placed by customer */
    long countByUserId(Long userId);

    /** Sum completed spending for a customer */
    @Query("SELECT COALESCE(SUM(o.totalAmount), 0) FROM Order o WHERE o.user.id = :userId AND o.status = com.candyshop.entity.OrderStatus.COMPLETED")
    BigDecimal sumCompletedSpendingByUserId(@Param("userId") Long userId);

    /** Get recent orders of a customer */
    List<Order> findTop10ByUserIdOrderByCreatedAtDesc(Long userId);

    /** Get top spending customers */
    @Query("SELECT o.user.id, o.user.fullName, o.user.email, o.user.phone, o.user.avatarUrl, COUNT(o), SUM(o.totalAmount) " +
           "FROM Order o WHERE o.status = com.candyshop.entity.OrderStatus.COMPLETED " +
           "AND o.user.role = com.candyshop.entity.Role.ROLE_USER " +
           "GROUP BY o.user.id, o.user.fullName, o.user.email, o.user.phone, o.user.avatarUrl " +
           "ORDER BY SUM(o.totalAmount) DESC")
    List<Object[]> findTopSpenders(Pageable pageable);
}

