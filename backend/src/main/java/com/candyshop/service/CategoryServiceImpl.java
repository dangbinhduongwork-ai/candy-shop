package com.candyshop.service;

import com.candyshop.dto.CategoryReorderItem;
import com.candyshop.dto.CategoryRequest;
import com.candyshop.dto.CategoryResponse;
import com.candyshop.entity.Category;
import com.candyshop.exception.BadRequestException;
import com.candyshop.exception.ResourceNotFoundException;
import com.candyshop.repository.CategoryRepository;
import com.candyshop.repository.ProductRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class CategoryServiceImpl implements CategoryService {

    private final CategoryRepository categoryRepository;
    private final ProductRepository productRepository;

    public CategoryServiceImpl(CategoryRepository categoryRepository, ProductRepository productRepository) {
        this.categoryRepository = categoryRepository;
        this.productRepository = productRepository;
    }

    @Override
    @Transactional(readOnly = true)
    public List<CategoryResponse> getAllCategories(boolean includeInactive) {
        List<Category> categories;
        if (includeInactive) {
            categories = categoryRepository.findAllByOrderByDisplayOrderAscIdAsc();
        } else {
            categories = categoryRepository.findAllByActiveTrueOrderByDisplayOrderAscIdAsc();
        }

        return categories.stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public CategoryResponse getCategoryById(Long id) {
        Category category = categoryRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy loại bánh kẹo với ID: " + id));
        return mapToResponse(category);
    }

    @Override
    @Transactional
    public CategoryResponse createCategory(CategoryRequest request) {
        String trimmedName = request.getName().trim();
        if (categoryRepository.existsByNameIgnoreCase(trimmedName)) {
            throw new BadRequestException("Tên loại bánh kẹo đã tồn tại: " + trimmedName);
        }

        Category category = new Category();
        category.setName(trimmedName);
        category.setDescription(request.getDescription());
        category.setImageUrl(request.getImageUrl());
        
        if (request.getDisplayOrder() != null) {
            category.setDisplayOrder(request.getDisplayOrder());
        } else {
            category.setDisplayOrder((int) categoryRepository.count() + 1);
        }

        if (request.getActive() != null) {
            category.setActive(request.getActive());
        } else {
            category.setActive(true);
        }

        Category saved = categoryRepository.save(category);
        return mapToResponse(saved);
    }

    @Override
    @Transactional
    public CategoryResponse updateCategory(Long id, CategoryRequest request) {
        Category category = categoryRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy loại bánh kẹo với ID: " + id));

        String trimmedName = request.getName().trim();
        if (categoryRepository.existsByNameIgnoreCaseAndIdNot(trimmedName, id)) {
            throw new BadRequestException("Tên loại bánh kẹo đã tồn tại: " + trimmedName);
        }

        category.setName(trimmedName);
        category.setDescription(request.getDescription());
        category.setImageUrl(request.getImageUrl());

        if (request.getDisplayOrder() != null) {
            category.setDisplayOrder(request.getDisplayOrder());
        }

        if (request.getActive() != null) {
            category.setActive(request.getActive());
        }

        Category updated = categoryRepository.save(category);
        return mapToResponse(updated);
    }

    @Override
    @Transactional
    public CategoryResponse toggleStatus(Long id, Boolean active) {
        Category category = categoryRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy loại bánh kẹo với ID: " + id));

        if (active != null) {
            category.setActive(active);
        } else {
            category.setActive(!Boolean.TRUE.equals(category.getActive()));
        }

        Category updated = categoryRepository.save(category);
        return mapToResponse(updated);
    }

    @Override
    @Transactional
    public void reorderCategories(List<CategoryReorderItem> items) {
        if (items == null || items.isEmpty()) return;

        for (CategoryReorderItem item : items) {
            if (item.getId() != null && item.getDisplayOrder() != null) {
                categoryRepository.findById(item.getId()).ifPresent(category -> {
                    category.setDisplayOrder(item.getDisplayOrder());
                    categoryRepository.save(category);
                });
            }
        }
    }

    @Override
    @Transactional
    public void deleteCategory(Long id) {
        Category category = categoryRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy loại bánh kẹo với ID: " + id));

        long productCount = productRepository.countByCategoryId(id);
        if (productCount > 0) {
            throw new BadRequestException("Không thể xoá danh mục '" + category.getName() + "' vì đang có " + productCount + " sản phẩm thuộc danh mục này. Vui lòng chuyển các sản phẩm sang danh mục khác trước khi xoá.");
        }

        categoryRepository.delete(category);
    }

    private CategoryResponse mapToResponse(Category category) {
        long productCount = productRepository.countByCategoryId(category.getId());
        return new CategoryResponse(
                category.getId(),
                category.getName(),
                category.getDescription(),
                category.getImageUrl(),
                category.getDisplayOrder(),
                category.getActive(),
                productCount
        );
    }
}
