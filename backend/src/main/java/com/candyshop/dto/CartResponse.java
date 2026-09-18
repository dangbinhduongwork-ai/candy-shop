package com.candyshop.dto;

import java.math.BigDecimal;
import java.util.List;

public class CartResponse {

    private Long id;
    private List<CartItemResponse> items;
    private int totalItems;
    private BigDecimal totalAmount;

    public CartResponse() {}

    public CartResponse(Long id, List<CartItemResponse> items, int totalItems, BigDecimal totalAmount) {
        this.id = id;
        this.items = items;
        this.totalItems = totalItems;
        this.totalAmount = totalAmount;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public List<CartItemResponse> getItems() {
        return items;
    }

    public void setItems(List<CartItemResponse> items) {
        this.items = items;
    }

    public int getTotalItems() {
        return totalItems;
    }

    public void setTotalItems(int totalItems) {
        this.totalItems = totalItems;
    }

    public BigDecimal getTotalAmount() {
        return totalAmount;
    }

    public void setTotalAmount(BigDecimal totalAmount) {
        this.totalAmount = totalAmount;
    }
}
