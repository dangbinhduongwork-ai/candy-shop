package com.candyshop.service;

import com.candyshop.dto.CustomerDetailResponse;
import com.candyshop.dto.CustomerStatsResponse;
import com.candyshop.dto.CustomerSummaryResponse;
import com.candyshop.entity.UserStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface AdminCustomerService {

    Page<CustomerSummaryResponse> getCustomers(String search, UserStatus status, Pageable pageable);

    CustomerDetailResponse getCustomerById(Long id);

    CustomerSummaryResponse updateCustomerStatus(Long id, UserStatus newStatus);

    CustomerStatsResponse getCustomerStats();
}
