package com.candyshop.entity;

/**
 * Order status enumeration representing order lifecycle.
 */
public enum OrderStatus {
    PENDING,    // Chờ xác nhận
    CONFIRMED,  // Đã xác nhận
    SHIPPING,   // Đang giao hàng
    COMPLETED,  // Hoàn thành
    CANCELLED   // Đã huỷ
}
