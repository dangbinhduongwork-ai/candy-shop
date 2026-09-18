package com.candyshop.service;

import com.candyshop.dto.CategoryResponse;
import com.candyshop.dto.PageResponse;
import com.candyshop.dto.ProductRequest;
import com.candyshop.dto.ProductResponse;
import com.candyshop.entity.Category;
import com.candyshop.entity.Product;
import com.candyshop.exception.ResourceNotFoundException;
import com.candyshop.repository.CategoryRepository;
import com.candyshop.repository.ProductRepository;
import com.candyshop.repository.ReviewRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
public class ProductServiceImpl implements ProductService {

    private final ProductRepository productRepository;
    private final CategoryRepository categoryRepository;
    private final ReviewRepository reviewRepository;

    public ProductServiceImpl(ProductRepository productRepository,
                              CategoryRepository categoryRepository,
                              ReviewRepository reviewRepository) {
        this.productRepository = productRepository;
        this.categoryRepository = categoryRepository;
        this.reviewRepository = reviewRepository;
    }

    @Override
    @Transactional(readOnly = true)
    public PageResponse<ProductResponse> getProducts(int page, int size, String sortBy, String sortDir,
                                                     Long categoryId, String keyword,
                                                     BigDecimal minPrice, BigDecimal maxPrice) {
        Sort sort = sortDir.equalsIgnoreCase(Sort.Direction.ASC.name()) ?
                Sort.by(sortBy).ascending() :
                Sort.by(sortBy).descending();

        Pageable pageable = PageRequest.of(page, size, sort);

        String searchKeyword = (keyword != null && !keyword.trim().isEmpty()) ? keyword.trim() : null;

        Page<Product> productPage = productRepository.findAllWithFilter(categoryId, searchKeyword, minPrice, maxPrice, pageable);

        List<Long> productIds = productPage.getContent().stream().map(Product::getId).toList();
        Map<Long, Double> avgRatings = new HashMap<>();
        Map<Long, Long> reviewCounts = new HashMap<>();

        if (!productIds.isEmpty()) {
            List<Object[]> statsList = reviewRepository.getRatingStatsForProductIds(productIds);
            for (Object[] row : statsList) {
                Long pId = (Long) row[0];
                Double rawAvg = row[1] != null ? ((Number) row[1]).doubleValue() : 0.0;
                Double roundedAvg = Math.round(rawAvg * 10.0) / 10.0;
                Long count = row[2] != null ? ((Number) row[2]).longValue() : 0L;
                avgRatings.put(pId, roundedAvg);
                reviewCounts.put(pId, count);
            }
        }

        List<ProductResponse> content = productPage.getContent().stream()
                .map(p -> mapToResponseWithStats(p, avgRatings.getOrDefault(p.getId(), 0.0), reviewCounts.getOrDefault(p.getId(), 0L)))
                .collect(Collectors.toList());

        return new PageResponse<>(
                content,
                productPage.getNumber(),
                productPage.getSize(),
                productPage.getTotalElements(),
                productPage.getTotalPages(),
                productPage.isLast()
        );
    }

    @Override
    @Transactional(readOnly = true)
    public ProductResponse getProductById(Long id) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy sản phẩm với ID: " + id));

        Double rawAvg = reviewRepository.getAverageRatingByProductId(id);
        Double avgRating = 0.0;
        if (rawAvg != null) {
            avgRating = Math.round(rawAvg * 10.0) / 10.0;
        }
        long count = reviewRepository.countByProductId(id);

        return mapToResponseWithStats(product, avgRating, count);
    }

    @Override
    @Transactional
    public ProductResponse createProduct(ProductRequest request) {
        Category category = categoryRepository.findById(request.getCategoryId())
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy loại bánh kẹo với ID: " + request.getCategoryId()));

        Product product = new Product();
        product.setName(request.getName().trim());
        product.setDescription(request.getDescription());
        product.setPrice(request.getPrice());
        product.setStockQuantity(request.getStockQuantity());
        product.setCategory(category);
        product.setImageUrl(request.getImageUrl());

        Product saved = productRepository.save(product);
        return mapToResponseWithStats(saved, 0.0, 0L);
    }

    @Override
    @Transactional
    public ProductResponse updateProduct(Long id, ProductRequest request) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy sản phẩm với ID: " + id));

        Category category = categoryRepository.findById(request.getCategoryId())
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy loại bánh kẹo với ID: " + request.getCategoryId()));

        product.setName(request.getName().trim());
        product.setDescription(request.getDescription());
        product.setPrice(request.getPrice());
        product.setStockQuantity(request.getStockQuantity());
        product.setCategory(category);
        product.setImageUrl(request.getImageUrl());

        Product updated = productRepository.save(product);

        Double rawAvg = reviewRepository.getAverageRatingByProductId(id);
        Double avgRating = 0.0;
        if (rawAvg != null) {
            avgRating = Math.round(rawAvg * 10.0) / 10.0;
        }
        long count = reviewRepository.countByProductId(id);

        return mapToResponseWithStats(updated, avgRating, count);
    }

    @Override
    @Transactional
    public void deleteProduct(Long id) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy sản phẩm với ID: " + id));
        productRepository.delete(product);
    }

    private ProductResponse mapToResponseWithStats(Product product, Double avgRating, Long count) {
        CategoryResponse categoryResponse = null;
        if (product.getCategory() != null) {
            categoryResponse = new CategoryResponse(
                    product.getCategory().getId(),
                    product.getCategory().getName(),
                    product.getCategory().getDescription(),
                    product.getCategory().getImageUrl(),
                    product.getCategory().getDisplayOrder(),
                    product.getCategory().getActive(),
                    null
            );
        }

        return new ProductResponse(
                product.getId(),
                product.getName(),
                product.getDescription(),
                product.getPrice(),
                product.getStockQuantity(),
                categoryResponse,
                product.getImageUrl(),
                avgRating,
                count,
                product.getCreatedAt(),
                product.getUpdatedAt()
        );
    }
}
