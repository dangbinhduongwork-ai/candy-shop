package com.candyshop.repository;

import com.candyshop.entity.Review;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ReviewRepository extends JpaRepository<Review, Long> {

    Page<Review> findByProductIdOrderByCreatedAtDesc(Long productId, Pageable pageable);

    Optional<Review> findByProductIdAndUserEmail(Long productId, String userEmail);

    boolean existsByProductIdAndUserEmail(Long productId, String userEmail);

    @Query("SELECT AVG(r.rating) FROM Review r WHERE r.product.id = :productId")
    Double getAverageRatingByProductId(@Param("productId") Long productId);

    long countByProductId(Long productId);

    long countByProductIdAndRating(Long productId, Integer rating);

    @Query("SELECT r.product.id, AVG(r.rating), COUNT(r) FROM Review r WHERE r.product.id IN :productIds GROUP BY r.product.id")
    List<Object[]> getRatingStatsForProductIds(@Param("productIds") List<Long> productIds);
}
