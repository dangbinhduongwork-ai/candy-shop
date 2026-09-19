package com.candyshop.repository;

import com.candyshop.entity.Cart;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface CartRepository extends JpaRepository<Cart, Long> {
    Optional<Cart> findByUserId(Long userId);

    @org.springframework.data.jpa.repository.EntityGraph(attributePaths = {"items", "items.product"})
    Optional<Cart> findByUserEmail(String email);
}
