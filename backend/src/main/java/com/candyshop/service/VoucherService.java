package com.candyshop.service;

import com.candyshop.dto.ApplyVoucherResponse;
import com.candyshop.dto.PageResponse;
import com.candyshop.dto.VoucherRequest;
import com.candyshop.dto.VoucherResponse;
import com.candyshop.entity.VoucherStatus;

import java.util.List;

public interface VoucherService {

    PageResponse<VoucherResponse> getAdminVouchers(int page, int size, String search, VoucherStatus status);

    VoucherResponse getVoucherById(Long id);

    VoucherResponse createVoucher(VoucherRequest request);

    VoucherResponse updateVoucher(Long id, VoucherRequest request);

    void deleteVoucher(Long id);

    ApplyVoucherResponse validateAndApplyVoucher(String userEmail, String code);

    List<VoucherResponse> getActiveVouchers();
}
