package com.candyshop.service;

import com.candyshop.dto.PageResponse;
import com.candyshop.dto.ProductRequest;
import com.candyshop.dto.ProductResponse;

import java.math.BigDecimal;

public interface ProductService {
    PageResponse<ProductResponse> getProducts(int page, int size, String sortBy, String sortDir, Long categoryId, String keyword, BigDecimal minPrice, BigDecimal maxPrice);
    ProductResponse getProductById(Long id);
    ProductResponse createProduct(ProductRequest request);
    ProductResponse updateProduct(Long id, ProductRequest request);
    void deleteProduct(Long id);
}
