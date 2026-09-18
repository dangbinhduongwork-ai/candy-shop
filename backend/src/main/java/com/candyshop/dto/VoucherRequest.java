package com.candyshop.dto;

import com.candyshop.entity.DiscountType;
import com.candyshop.entity.VoucherStatus;
import jakarta.validation.constraints.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;

public class VoucherRequest {

    @NotBlank(message = "Mã voucher không được để trống")
    @Size(min = 2, max = 50, message = "Mã voucher từ 2 đến 50 ký tự")
    @Pattern(regexp = "^[a-zA-Z0-9_-]+$", message = "Mã voucher chỉ được chứa chữ cái, chữ số, gạch nối và gạch dưới")
    private String code;

    @NotBlank(message = "Tên/tiêu đề voucher không được để trống")
    @Size(max = 255, message = "Tên voucher tối đa 255 ký tự")
    private String name;

    @Size(max = 500, message = "Mô tả voucher tối đa 500 ký tự")
    private String description;

    @NotNull(message = "Loại giảm giá không được để trống (PERCENTAGE hoặc FIXED_AMOUNT)")
    private DiscountType discountType;

    @NotNull(message = "Giá trị giảm không được để trống")
    @DecimalMin(value = "0.01", message = "Giá trị giảm phải lớn hơn 0")
    private BigDecimal discountValue;

    @DecimalMin(value = "0.0", message = "Giá trị đơn hàng tối thiểu không được âm")
    private BigDecimal minOrderAmount = BigDecimal.ZERO;

    @DecimalMin(value = "0.0", message = "Số tiền giảm tối đa không được âm")
    private BigDecimal maxDiscountAmount;

    @NotNull(message = "Ngày bắt đầu áp dụng không được để trống")
    private LocalDateTime startDate;

    @NotNull(message = "Ngày hết hạn không được để trống")
    private LocalDateTime endDate;

    @Min(value = 1, message = "Tổng số lượt dùng tối đa phải từ 1 trở lên")
    private Integer maxUsageCount = 100;

    @Min(value = 1, message = "Số lượt dùng tối đa mỗi khách hàng phải từ 1 trở lên")
    private Integer maxUsagePerUser = 1;

    private VoucherStatus status = VoucherStatus.ACTIVE;

    public VoucherRequest() {}

    public String getCode() { return code; }
    public void setCode(String code) { this.code = code != null ? code.trim().toUpperCase() : null; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public DiscountType getDiscountType() { return discountType; }
    public void setDiscountType(DiscountType discountType) { this.discountType = discountType; }

    public BigDecimal getDiscountValue() { return discountValue; }
    public void setDiscountValue(BigDecimal discountValue) { this.discountValue = discountValue; }

    public BigDecimal getMinOrderAmount() { return minOrderAmount; }
    public void setMinOrderAmount(BigDecimal minOrderAmount) { this.minOrderAmount = minOrderAmount; }

    public BigDecimal getMaxDiscountAmount() { return maxDiscountAmount; }
    public void setMaxDiscountAmount(BigDecimal maxDiscountAmount) { this.maxDiscountAmount = maxDiscountAmount; }

    public LocalDateTime getStartDate() { return startDate; }
    public void setStartDate(LocalDateTime startDate) { this.startDate = startDate; }

    public LocalDateTime getEndDate() { return endDate; }
    public void setEndDate(LocalDateTime endDate) { this.endDate = endDate; }

    public Integer getMaxUsageCount() { return maxUsageCount; }
    public void setMaxUsageCount(Integer maxUsageCount) { this.maxUsageCount = maxUsageCount; }

    public Integer getMaxUsagePerUser() { return maxUsagePerUser; }
    public void setMaxUsagePerUser(Integer maxUsagePerUser) { this.maxUsagePerUser = maxUsagePerUser; }

    public VoucherStatus getStatus() { return status; }
    public void setStatus(VoucherStatus status) { this.status = status; }
}
