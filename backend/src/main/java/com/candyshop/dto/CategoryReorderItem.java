package com.candyshop.dto;

import jakarta.validation.constraints.NotNull;

public class CategoryReorderItem {

    @NotNull(message = "ID danh mục không được để trống")
    private Long id;

    @NotNull(message = "displayOrder không được để trống")
    private Integer displayOrder;

    public CategoryReorderItem() {}

    public CategoryReorderItem(Long id, Integer displayOrder) {
        this.id = id;
        this.displayOrder = displayOrder;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Integer getDisplayOrder() {
        return displayOrder;
    }

    public void setDisplayOrder(Integer displayOrder) {
        this.displayOrder = displayOrder;
    }
}
