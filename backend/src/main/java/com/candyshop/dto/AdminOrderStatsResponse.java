package com.candyshop.dto;

import java.math.BigDecimal;
import java.util.Map;

/**
 * DTO representing overview dashboard statistics for admin.
 */
public class AdminOrderStatsResponse {

    private long totalOrders;
    private BigDecimal totalRevenue;
    private Map<String, Long> countByStatus;
    private long lowStockCount;

    public AdminOrderStatsResponse() {}

    public AdminOrderStatsResponse(long totalOrders, BigDecimal totalRevenue,
                                   Map<String, Long> countByStatus, long lowStockCount) {
        this.totalOrders = totalOrders;
        this.totalRevenue = totalRevenue != null ? totalRevenue : BigDecimal.ZERO;
        this.countByStatus = countByStatus;
        this.lowStockCount = lowStockCount;
    }

    public long getTotalOrders() {
        return totalOrders;
    }

    public void setTotalOrders(long totalOrders) {
        this.totalOrders = totalOrders;
    }

    public BigDecimal getTotalRevenue() {
        return totalRevenue;
    }

    public void setTotalRevenue(BigDecimal totalRevenue) {
        this.totalRevenue = totalRevenue;
    }

    public Map<String, Long> getCountByStatus() {
        return countByStatus;
    }

    public void setCountByStatus(Map<String, Long> countByStatus) {
        this.countByStatus = countByStatus;
    }

    public long getLowStockCount() {
        return lowStockCount;
    }

    public void setLowStockCount(long lowStockCount) {
        this.lowStockCount = lowStockCount;
    }
}
