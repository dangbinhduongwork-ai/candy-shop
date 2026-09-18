package com.candyshop.controller;

import com.candyshop.dto.CategoryReorderItem;
import com.candyshop.dto.CategoryRequest;
import com.candyshop.dto.CategoryResponse;
import com.candyshop.dto.CategoryStatusRequest;
import com.candyshop.service.CategoryService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/categories")
public class CategoryController {

    private final CategoryService categoryService;

    public CategoryController(CategoryService categoryService) {
        this.categoryService = categoryService;
    }

    @GetMapping
    public ResponseEntity<List<CategoryResponse>> getAllCategories(
            @RequestParam(name = "includeInactive", defaultValue = "false") boolean includeInactive) {
        return ResponseEntity.ok(categoryService.getAllCategories(includeInactive));
    }

    @GetMapping("/{id}")
    public ResponseEntity<CategoryResponse> getCategoryById(@PathVariable Long id) {
        return ResponseEntity.ok(categoryService.getCategoryById(id));
    }

    @PostMapping
    public ResponseEntity<CategoryResponse> createCategory(@Valid @RequestBody CategoryRequest request) {
        CategoryResponse created = categoryService.createCategory(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    @PutMapping("/{id}")
    public ResponseEntity<CategoryResponse> updateCategory(
            @PathVariable Long id,
            @Valid @RequestBody CategoryRequest request) {
        CategoryResponse updated = categoryService.updateCategory(id, request);
        return ResponseEntity.ok(updated);
    }

    @PutMapping("/{id}/status")
    public ResponseEntity<CategoryResponse> toggleCategoryStatus(
            @PathVariable Long id,
            @RequestBody(required = false) CategoryStatusRequest request) {
        Boolean active = request != null ? request.getActive() : null;
        CategoryResponse updated = categoryService.toggleStatus(id, active);
        return ResponseEntity.ok(updated);
    }

    @PutMapping("/reorder")
    public ResponseEntity<Void> reorderCategories(@RequestBody List<CategoryReorderItem> items) {
        categoryService.reorderCategories(items);
        return ResponseEntity.ok().build();
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteCategory(@PathVariable Long id) {
        categoryService.deleteCategory(id);
        return ResponseEntity.noContent().build();
    }
}
