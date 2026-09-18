package com.candyshop.dto;

import jakarta.validation.constraints.NotNull;

public class CategoryStatusRequest {

    @NotNull(message = "Trạng thái active không được để trống")
    private Boolean active;

    public CategoryStatusRequest() {}

    public CategoryStatusRequest(Boolean active) {
        this.active = active;
    }

    public Boolean getActive() {
        return active;
    }

    public void setActive(Boolean active) {
        this.active = active;
    }
}
