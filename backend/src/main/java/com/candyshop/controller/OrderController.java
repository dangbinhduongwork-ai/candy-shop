package com.candyshop.controller;

import com.candyshop.dto.CreateOrderRequest;
import com.candyshop.dto.OrderResponse;
import com.candyshop.dto.PageResponse;
import com.candyshop.service.OrderService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

/**
 * REST Controller for Customer Orders & Order Management.
 */
@RestController
@RequestMapping("/api/orders")
public class OrderController {

    private final OrderService orderService;

    public OrderController(OrderService orderService) {
        this.orderService = orderService;
    }

    /**
     * POST /api/orders : Place order from current user's shopping cart
     */
    @PostMapping
    public ResponseEntity<OrderResponse> createOrder(@AuthenticationPrincipal UserDetails userDetails,
                                                     @Valid @RequestBody CreateOrderRequest request) {
        OrderResponse response = orderService.createOrder(userDetails.getUsername(), request);
        return new ResponseEntity<>(response, HttpStatus.CREATED);
    }

    /**
     * GET /api/orders : Get paginated list of current user's orders (newest first)
     */
    @GetMapping
    public ResponseEntity<PageResponse<OrderResponse>> getUserOrders(
            @AuthenticationPrincipal UserDetails userDetails,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        PageResponse<OrderResponse> response = orderService.getUserOrders(userDetails.getUsername(), page, size);
        return ResponseEntity.ok(response);
    }

    /**
     * GET /api/orders/{id} : Get order details by ID
     */
    @GetMapping("/{id}")
    public ResponseEntity<OrderResponse> getOrderById(@AuthenticationPrincipal UserDetails userDetails,
                                                      @PathVariable Long id) {
        OrderResponse response = orderService.getOrderById(userDetails.getUsername(), id);
        return ResponseEntity.ok(response);
    }

    /**
     * PUT /api/orders/{id}/cancel : Cancel an order (PENDING status only, restores stock)
     */
    @PutMapping("/{id}/cancel")
    public ResponseEntity<OrderResponse> cancelOrder(@AuthenticationPrincipal UserDetails userDetails,
                                                     @PathVariable Long id) {
        OrderResponse response = orderService.cancelOrder(userDetails.getUsername(), id);
        return ResponseEntity.ok(response);
    }
}
