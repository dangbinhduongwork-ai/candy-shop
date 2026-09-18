package com.candyshop.controller;

import com.candyshop.dto.PageResponse;
import com.candyshop.dto.VoucherRequest;
import com.candyshop.dto.VoucherResponse;
import com.candyshop.entity.VoucherStatus;
import com.candyshop.service.VoucherService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/admin/vouchers")
public class AdminVoucherController {

    private final VoucherService voucherService;

    public AdminVoucherController(VoucherService voucherService) {
        this.voucherService = voucherService;
    }

    /**
     * GET /api/admin/vouchers
     * Paginated list of vouchers with optional search and status filter.
     */
    @GetMapping
    public ResponseEntity<PageResponse<VoucherResponse>> getVouchers(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(required = false) String search,
            @RequestParam(required = false) VoucherStatus status) {
        PageResponse<VoucherResponse> response = voucherService.getAdminVouchers(page, size, search, status);
        return ResponseEntity.ok(response);
    }

    /**
     * GET /api/admin/vouchers/{id}
     * Get voucher details by ID.
     */
    @GetMapping("/{id}")
    public ResponseEntity<VoucherResponse> getVoucherById(@PathVariable Long id) {
        VoucherResponse response = voucherService.getVoucherById(id);
        return ResponseEntity.ok(response);
    }

    /**
     * POST /api/admin/vouchers
     * Create a new voucher.
     */
    @PostMapping
    public ResponseEntity<VoucherResponse> createVoucher(@Valid @RequestBody VoucherRequest request) {
        VoucherResponse response = voucherService.createVoucher(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    /**
     * PUT /api/admin/vouchers/{id}
     * Update an existing voucher.
     */
    @PutMapping("/{id}")
    public ResponseEntity<VoucherResponse> updateVoucher(
            @PathVariable Long id,
            @Valid @RequestBody VoucherRequest request) {
        VoucherResponse response = voucherService.updateVoucher(id, request);
        return ResponseEntity.ok(response);
    }

    /**
     * DELETE /api/admin/vouchers/{id}
     * Delete or deactivate voucher (soft deactivation if used before).
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteVoucher(@PathVariable Long id) {
        voucherService.deleteVoucher(id);
        return ResponseEntity.noContent().build();
    }
}
