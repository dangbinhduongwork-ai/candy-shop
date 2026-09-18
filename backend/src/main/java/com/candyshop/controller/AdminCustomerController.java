package com.candyshop.controller;

import com.candyshop.dto.CustomerDetailResponse;
import com.candyshop.dto.CustomerStatsResponse;
import com.candyshop.dto.CustomerSummaryResponse;
import com.candyshop.dto.UpdateCustomerStatusRequest;
import com.candyshop.entity.UserStatus;
import com.candyshop.service.AdminCustomerService;
import jakarta.validation.Valid;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/admin/customers")
public class AdminCustomerController {

    private final AdminCustomerService customerService;

    public AdminCustomerController(AdminCustomerService customerService) {
        this.customerService = customerService;
    }

    /**
     * GET /api/admin/customers
     * Fetch paginated list of customers (ROLE_USER only) with search & status filter.
     */
    @GetMapping
    public ResponseEntity<Page<CustomerSummaryResponse>> getCustomers(
            @RequestParam(required = false) String search,
            @RequestParam(required = false) UserStatus status,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "createdAt") String sortBy,
            @RequestParam(defaultValue = "desc") String direction) {

        Sort sort = direction.equalsIgnoreCase("asc") ? Sort.by(sortBy).ascending() : Sort.by(sortBy).descending();
        PageRequest pageRequest = PageRequest.of(page, size, sort);

        Page<CustomerSummaryResponse> result = customerService.getCustomers(search, status, pageRequest);
        return ResponseEntity.ok(result);
    }

    /**
     * GET /api/admin/customers/stats
     * Get aggregate statistics on customers and top spenders.
     */
    @GetMapping("/stats")
    public ResponseEntity<CustomerStatsResponse> getCustomerStats() {
        CustomerStatsResponse stats = customerService.getCustomerStats();
        return ResponseEntity.ok(stats);
    }

    /**
     * GET /api/admin/customers/{id}
     * Get full customer profile, spending total, and recent order history.
     */
    @GetMapping("/{id}")
    public ResponseEntity<CustomerDetailResponse> getCustomerById(@PathVariable Long id) {
        CustomerDetailResponse detail = customerService.getCustomerById(id);
        return ResponseEntity.ok(detail);
    }

    /**
     * PUT /api/admin/customers/{id}/status
     * Lock (LOCKED) or unlock (ACTIVE) a customer account.
     */
    @PutMapping("/{id}/status")
    public ResponseEntity<CustomerSummaryResponse> updateCustomerStatus(
            @PathVariable Long id,
            @Valid @RequestBody UpdateCustomerStatusRequest request) {
        CustomerSummaryResponse updated = customerService.updateCustomerStatus(id, request.getStatus());
        return ResponseEntity.ok(updated);
    }
}
