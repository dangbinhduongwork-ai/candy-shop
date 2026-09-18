package com.candyshop.service;

import com.candyshop.dto.AdminOrderStatsResponse;
import com.candyshop.dto.OrderResponse;
import com.candyshop.dto.PageResponse;
import com.candyshop.entity.OrderStatus;

import java.time.LocalDate;

public interface AdminOrderService {

    PageResponse<OrderResponse> getAllOrders(OrderStatus status,
                                             LocalDate startDate,
                                             LocalDate endDate,
                                             String search,
                                             int page,
                                             int size);

    OrderResponse getOrderById(Long id);

    OrderResponse updateOrderStatus(Long id, OrderStatus newStatus);

    AdminOrderStatsResponse getOrderStats();
}
