package com.candyshop.repository;

import com.candyshop.entity.Category;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface CategoryRepository extends JpaRepository<Category, Long> {
    boolean existsByNameIgnoreCase(String name);
    boolean existsByNameIgnoreCaseAndIdNot(String name, Long id);
    Optional<Category> findByNameIgnoreCase(String name);

    List<Category> findAllByOrderByDisplayOrderAscIdAsc();
    List<Category> findAllByActiveTrueOrderByDisplayOrderAscIdAsc();

    long countByActiveTrue();
}
