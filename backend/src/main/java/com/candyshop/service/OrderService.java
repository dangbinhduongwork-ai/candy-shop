package com.candyshop.service;

import com.candyshop.dto.CreateOrderRequest;
import com.candyshop.dto.OrderResponse;
import com.candyshop.dto.PageResponse;

public interface OrderService {

    /**
     * Creates an order from the user's current shopping cart in a single transaction:
     * 1. Validates cart is not empty
     * 2. Validates product stock
     * 3. Deducts stock from products
     * 4. Creates Order & OrderItems with priceAtOrder
     * 5. Clears user's cart
     * Rollback occurs if any step fails.
     */
    OrderResponse createOrder(String email, CreateOrderRequest request);

    /**
     * Retrieves a paginated list of orders placed by the user, newest first.
     */
    PageResponse<OrderResponse> getUserOrders(String email, int page, int size);

    /**
     * Retrieves an order by ID (accessible by order owner or admin).
     */
    OrderResponse getOrderById(String email, Long id);

    /**
     * Cancels an order:
     * 1. Validates order status is PENDING
     * 2. Restores stock quantities for all items in order
     * 3. Sets status to CANCELLED
     */
    OrderResponse cancelOrder(String email, Long id);
}
