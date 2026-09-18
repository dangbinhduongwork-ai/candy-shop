package com.candyshop.service;

import com.candyshop.dto.CategoryReorderItem;
import com.candyshop.dto.CategoryRequest;
import com.candyshop.dto.CategoryResponse;

import java.util.List;

public interface CategoryService {
    List<CategoryResponse> getAllCategories(boolean includeInactive);
    CategoryResponse getCategoryById(Long id);
    CategoryResponse createCategory(CategoryRequest request);
    CategoryResponse updateCategory(Long id, CategoryRequest request);
    CategoryResponse toggleStatus(Long id, Boolean active);
    void reorderCategories(List<CategoryReorderItem> items);
    void deleteCategory(Long id);
}
