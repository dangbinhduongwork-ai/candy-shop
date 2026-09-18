package com.candyshop.dto;

import java.math.BigDecimal;
import java.util.List;

public class CustomerStatsResponse {

    private long totalCustomers;
    private long newCustomersThisMonth;
    private long activeCustomers;
    private long lockedCustomers;
    private List<TopSpenderDTO> topSpenders;

    public CustomerStatsResponse() {}

    public CustomerStatsResponse(long totalCustomers, long newCustomersThisMonth,
                                 long activeCustomers, long lockedCustomers,
                                 List<TopSpenderDTO> topSpenders) {
        this.totalCustomers = totalCustomers;
        this.newCustomersThisMonth = newCustomersThisMonth;
        this.activeCustomers = activeCustomers;
        this.lockedCustomers = lockedCustomers;
        this.topSpenders = topSpenders;
    }

    public long getTotalCustomers() { return totalCustomers; }
    public void setTotalCustomers(long totalCustomers) { this.totalCustomers = totalCustomers; }

    public long getNewCustomersThisMonth() { return newCustomersThisMonth; }
    public void setNewCustomersThisMonth(long newCustomersThisMonth) { this.newCustomersThisMonth = newCustomersThisMonth; }

    public long getActiveCustomers() { return activeCustomers; }
    public void setActiveCustomers(long activeCustomers) { this.activeCustomers = activeCustomers; }

    public long getLockedCustomers() { return lockedCustomers; }
    public void setLockedCustomers(long lockedCustomers) { this.lockedCustomers = lockedCustomers; }

    public List<TopSpenderDTO> getTopSpenders() { return topSpenders; }
    public void setTopSpenders(List<TopSpenderDTO> topSpenders) { this.topSpenders = topSpenders; }

    public static class TopSpenderDTO {
        private Long id;
        private String fullName;
        private String email;
        private String phone;
        private String avatarUrl;
        private long orderCount;
        private BigDecimal totalSpent;

        public TopSpenderDTO() {}

        public TopSpenderDTO(Long id, String fullName, String email, String phone,
                             String avatarUrl, long orderCount, BigDecimal totalSpent) {
            this.id = id;
            this.fullName = fullName;
            this.email = email;
            this.phone = phone;
            this.avatarUrl = avatarUrl;
            this.orderCount = orderCount;
            this.totalSpent = totalSpent;
        }

        public Long getId() { return id; }
        public void setId(Long id) { this.id = id; }

        public String getFullName() { return fullName; }
        public void setFullName(String fullName) { this.fullName = fullName; }

        public String getEmail() { return email; }
        public void setEmail(String email) { this.email = email; }

        public String getPhone() { return phone; }
        public void setPhone(String phone) { this.phone = phone; }

        public String getAvatarUrl() { return avatarUrl; }
        public void setAvatarUrl(String avatarUrl) { this.avatarUrl = avatarUrl; }

        public long getOrderCount() { return orderCount; }
        public void setOrderCount(long orderCount) { this.orderCount = orderCount; }

        public BigDecimal getTotalSpent() { return totalSpent; }
        public void setTotalSpent(BigDecimal totalSpent) { this.totalSpent = totalSpent; }
    }
}
