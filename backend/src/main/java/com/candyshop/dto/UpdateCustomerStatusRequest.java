package com.candyshop.dto;

import com.candyshop.entity.UserStatus;
import jakarta.validation.constraints.NotNull;

public class UpdateCustomerStatusRequest {

    @NotNull(message = "Trạng thái tài khoản không được để trống")
    private UserStatus status;

    public UpdateCustomerStatusRequest() {}

    public UpdateCustomerStatusRequest(UserStatus status) {
        this.status = status;
    }

    public UserStatus getStatus() { return status; }
    public void setStatus(UserStatus status) { this.status = status; }
}
