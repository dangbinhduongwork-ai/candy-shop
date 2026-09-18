package com.candyshop.controller;

import com.candyshop.dto.AdminOrderStatsResponse;
import com.candyshop.dto.OrderResponse;
import com.candyshop.dto.PageResponse;
import com.candyshop.dto.UpdateOrderStatusRequest;
import com.candyshop.entity.OrderStatus;
import com.candyshop.service.AdminOrderService;
import jakarta.validation.Valid;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;

/**
 * REST Controller for Administrator Order Management.
 * Accessible only by users with ROLE_ADMIN.
 */
@RestController
@RequestMapping("/api/admin/orders")
public class AdminOrderController {

    private final AdminOrderService adminOrderService;

    public AdminOrderController(AdminOrderService adminOrderService) {
        this.adminOrderService = adminOrderService;
    }

    /**
     * GET /api/admin/orders : Get all orders with filtering and pagination
     */
    @GetMapping
    public ResponseEntity<PageResponse<OrderResponse>> getAllOrders(
            @RequestParam(required = false) OrderStatus status,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate,
            @RequestParam(required = false) String search,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        PageResponse<OrderResponse> response = adminOrderService.getAllOrders(status, startDate, endDate, search, page, size);
        return ResponseEntity.ok(response);
    }

    /**
     * GET /api/admin/orders/stats : Get dashboard order & revenue statistics
     */
    @GetMapping("/stats")
    public ResponseEntity<AdminOrderStatsResponse> getOrderStats() {
        AdminOrderStatsResponse stats = adminOrderService.getOrderStats();
        return ResponseEntity.ok(stats);
    }

    /**
     * GET /api/admin/orders/{id} : Get full order detail by ID
     */
    @GetMapping("/{id}")
    public ResponseEntity<OrderResponse> getOrderById(@PathVariable Long id) {
        OrderResponse response = adminOrderService.getOrderById(id);
        return ResponseEntity.ok(response);
    }

    /**
     * PUT /api/admin/orders/{id}/status : Update order status with transition validation
     */
    @PutMapping("/{id}/status")
    public ResponseEntity<OrderResponse> updateOrderStatus(
            @PathVariable Long id,
            @Valid @RequestBody UpdateOrderStatusRequest request) {
        OrderResponse response = adminOrderService.updateOrderStatus(id, request.getStatus());
        return ResponseEntity.ok(response);
    }
}
