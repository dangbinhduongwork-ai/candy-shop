package com.candyshop.dto;

import com.candyshop.entity.OrderStatus;
import jakarta.validation.constraints.NotNull;

/**
 * Request body for updating order status by Admin.
 */
public class UpdateOrderStatusRequest {

    @NotNull(message = "Trạng thái đơn hàng không được để trống")
    private OrderStatus status;

    public UpdateOrderStatusRequest() {}

    public UpdateOrderStatusRequest(OrderStatus status) {
        this.status = status;
    }

    public OrderStatus getStatus() {
        return status;
    }

    public void setStatus(OrderStatus status) {
        this.status = status;
    }
}
