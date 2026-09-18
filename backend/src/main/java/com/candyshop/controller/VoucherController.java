package com.candyshop.controller;

import com.candyshop.dto.ApplyVoucherRequest;
import com.candyshop.dto.ApplyVoucherResponse;
import com.candyshop.dto.VoucherResponse;
import com.candyshop.service.VoucherService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/vouchers")
public class VoucherController {

    private final VoucherService voucherService;

    public VoucherController(VoucherService voucherService) {
        this.voucherService = voucherService;
    }

    /**
     * POST /api/vouchers/apply
     * Validate and preview voucher application on current user's cart.
     */
    @PostMapping("/apply")
    public ResponseEntity<ApplyVoucherResponse> applyVoucher(
            @AuthenticationPrincipal UserDetails userDetails,
            @Valid @RequestBody ApplyVoucherRequest request) {
        ApplyVoucherResponse response = voucherService.validateAndApplyVoucher(
                userDetails.getUsername(), request.getCode());
        return ResponseEntity.ok(response);
    }

    /**
     * GET /api/vouchers/available
     * Get active vouchers currently available for customers.
     */
    @GetMapping("/available")
    public ResponseEntity<List<VoucherResponse>> getAvailableVouchers() {
        List<VoucherResponse> vouchers = voucherService.getActiveVouchers();
        return ResponseEntity.ok(vouchers);
    }
}
