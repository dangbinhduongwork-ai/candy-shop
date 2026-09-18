package com.candyshop.service;

import com.candyshop.dto.ApplyVoucherResponse;
import com.candyshop.dto.PageResponse;
import com.candyshop.dto.VoucherRequest;
import com.candyshop.dto.VoucherResponse;
import com.candyshop.entity.*;
import com.candyshop.exception.BadRequestException;
import com.candyshop.exception.ResourceNotFoundException;
import com.candyshop.repository.CartRepository;
import com.candyshop.repository.UserRepository;
import com.candyshop.repository.VoucherRepository;
import com.candyshop.repository.VoucherUsageRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDateTime;
import java.util.List;

@Service
public class VoucherServiceImpl implements VoucherService {

    private final VoucherRepository voucherRepository;
    private final VoucherUsageRepository voucherUsageRepository;
    private final CartRepository cartRepository;
    private final UserRepository userRepository;

    public VoucherServiceImpl(VoucherRepository voucherRepository,
                              VoucherUsageRepository voucherUsageRepository,
                              CartRepository cartRepository,
                              UserRepository userRepository) {
        this.voucherRepository = voucherRepository;
        this.voucherUsageRepository = voucherUsageRepository;
        this.cartRepository = cartRepository;
        this.userRepository = userRepository;
    }

    @Override
    @Transactional(readOnly = true)
    public PageResponse<VoucherResponse> getAdminVouchers(int page, int size, String search, VoucherStatus status) {
        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt"));
        String searchParam = (search != null && !search.trim().isEmpty()) ? search.trim() : null;

        Page<Voucher> voucherPage = voucherRepository.findVouchersWithFilter(status, searchParam, pageable);

        List<VoucherResponse> content = voucherPage.getContent().stream()
                .map(this::mapToVoucherResponse)
                .toList();

        return new PageResponse<>(
                content,
                voucherPage.getNumber(),
                voucherPage.getSize(),
                voucherPage.getTotalElements(),
                voucherPage.getTotalPages(),
                voucherPage.isLast()
        );
    }

    @Override
    @Transactional(readOnly = true)
    public VoucherResponse getVoucherById(Long id) {
        Voucher voucher = voucherRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy mã giảm giá với ID: " + id));
        return mapToVoucherResponse(voucher);
    }

    @Override
    @Transactional
    public VoucherResponse createVoucher(VoucherRequest request) {
        String cleanCode = request.getCode().trim().toUpperCase();

        if (voucherRepository.existsByCodeIgnoreCase(cleanCode)) {
            throw new BadRequestException("Mã giảm giá '" + cleanCode + "' đã tồn tại");
        }

        validateVoucherRequest(request);

        Voucher voucher = new Voucher();
        voucher.setCode(cleanCode);
        voucher.setName(request.getName().trim());
        voucher.setDescription(request.getDescription() != null ? request.getDescription().trim() : null);
        voucher.setDiscountType(request.getDiscountType());
        voucher.setDiscountValue(request.getDiscountValue());
        voucher.setMinOrderAmount(request.getMinOrderAmount() != null ? request.getMinOrderAmount() : BigDecimal.ZERO);
        voucher.setMaxDiscountAmount(request.getMaxDiscountAmount());
        voucher.setStartDate(request.getStartDate());
        voucher.setEndDate(request.getEndDate());
        voucher.setMaxUsageCount(request.getMaxUsageCount());
        voucher.setUsedCount(0);
        voucher.setMaxUsagePerUser(request.getMaxUsagePerUser() != null ? request.getMaxUsagePerUser() : 1);
        voucher.setStatus(request.getStatus() != null ? request.getStatus() : VoucherStatus.ACTIVE);

        Voucher saved = voucherRepository.save(voucher);
        return mapToVoucherResponse(saved);
    }

    @Override
    @Transactional
    public VoucherResponse updateVoucher(Long id, VoucherRequest request) {
        Voucher voucher = voucherRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy mã giảm giá với ID: " + id));

        String cleanCode = request.getCode().trim().toUpperCase();
        if (!voucher.getCode().equalsIgnoreCase(cleanCode) && voucherRepository.existsByCodeIgnoreCase(cleanCode)) {
            throw new BadRequestException("Mã giảm giá '" + cleanCode + "' đã tồn tại");
        }

        validateVoucherRequest(request);

        voucher.setCode(cleanCode);
        voucher.setName(request.getName().trim());
        voucher.setDescription(request.getDescription() != null ? request.getDescription().trim() : null);
        voucher.setDiscountType(request.getDiscountType());
        voucher.setDiscountValue(request.getDiscountValue());
        voucher.setMinOrderAmount(request.getMinOrderAmount() != null ? request.getMinOrderAmount() : BigDecimal.ZERO);
        voucher.setMaxDiscountAmount(request.getMaxDiscountAmount());
        voucher.setStartDate(request.getStartDate());
        voucher.setEndDate(request.getEndDate());
        voucher.setMaxUsageCount(request.getMaxUsageCount());
        voucher.setMaxUsagePerUser(request.getMaxUsagePerUser() != null ? request.getMaxUsagePerUser() : 1);
        if (request.getStatus() != null) {
            voucher.setStatus(request.getStatus());
        }

        Voucher saved = voucherRepository.save(voucher);
        return mapToVoucherResponse(saved);
    }

    @Override
    @Transactional
    public void deleteVoucher(Long id) {
        Voucher voucher = voucherRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy mã giảm giá với ID: " + id));

        long usageCount = voucherUsageRepository.countByVoucherId(id);
        if (usageCount > 0) {
            // Soft deactivation to maintain historical records
            voucher.setStatus(VoucherStatus.INACTIVE);
            voucherRepository.save(voucher);
        } else {
            voucherRepository.delete(voucher);
        }
    }

    @Override
    @Transactional(readOnly = true)
    public ApplyVoucherResponse validateAndApplyVoucher(String userEmail, String code) {
        if (code == null || code.trim().isEmpty()) {
            return ApplyVoucherResponse.error("Vui lòng nhập mã giảm giá");
        }

        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy người dùng với email: " + userEmail));

        Cart cart = cartRepository.findByUserEmail(userEmail)
                .orElse(null);

        if (cart == null || cart.getItems() == null || cart.getItems().isEmpty()) {
            return ApplyVoucherResponse.error("Giỏ hàng của bạn đang trống");
        }

        // Calculate current subtotal
        BigDecimal subtotal = BigDecimal.ZERO;
        for (CartItem item : cart.getItems()) {
            BigDecimal price = item.getProduct() != null && item.getProduct().getPrice() != null
                    ? item.getProduct().getPrice()
                    : BigDecimal.ZERO;
            subtotal = subtotal.add(price.multiply(BigDecimal.valueOf(item.getQuantity())));
        }

        String cleanCode = code.trim().toUpperCase();
        Voucher voucher = voucherRepository.findByCodeIgnoreCase(cleanCode).orElse(null);

        if (voucher == null) {
            return ApplyVoucherResponse.error("Mã giảm giá '" + cleanCode + "' không tồn tại");
        }

        if (voucher.getStatus() != VoucherStatus.ACTIVE) {
            return ApplyVoucherResponse.error("Mã giảm giá này hiện đã ngừng áp dụng");
        }

        LocalDateTime now = LocalDateTime.now();
        if (voucher.getStartDate() != null && now.isBefore(voucher.getStartDate())) {
            return ApplyVoucherResponse.error("Mã giảm giá chưa đến thời gian áp dụng");
        }

        if (voucher.getEndDate() != null && now.isAfter(voucher.getEndDate())) {
            return ApplyVoucherResponse.error("Mã giảm giá đã hết hạn sử dụng");
        }

        if (voucher.getMaxUsageCount() != null && voucher.getUsedCount() >= voucher.getMaxUsageCount()) {
            return ApplyVoucherResponse.error("Mã giảm giá đã hết lượt sử dụng");
        }

        if (voucher.getMaxUsagePerUser() != null) {
            long userUsageCount = voucherUsageRepository.countByVoucherAndUser(voucher, user);
            if (userUsageCount >= voucher.getMaxUsagePerUser()) {
                return ApplyVoucherResponse.error("Bạn đã sử dụng hết số lần cho phép của mã giảm giá này");
            }
        }

        if (voucher.getMinOrderAmount() != null && subtotal.compareTo(voucher.getMinOrderAmount()) < 0) {
            return ApplyVoucherResponse.error(String.format("Đơn hàng tối thiểu phải từ %,dđ để áp dụng mã này (hiện tại: %,dđ)",
                    voucher.getMinOrderAmount().longValue(), subtotal.longValue()));
        }

        // Calculate discount
        BigDecimal discountAmount = calculateDiscount(voucher, subtotal);
        BigDecimal finalAmount = subtotal.subtract(discountAmount);
        if (finalAmount.compareTo(BigDecimal.ZERO) < 0) {
            finalAmount = BigDecimal.ZERO;
        }

        return new ApplyVoucherResponse(
                true,
                voucher.getCode(),
                voucher.getDiscountType(),
                voucher.getDiscountValue(),
                discountAmount,
                subtotal,
                finalAmount,
                "Áp dụng mã giảm giá thành công!"
        );
    }

    @Override
    @Transactional(readOnly = true)
    public List<VoucherResponse> getActiveVouchers() {
        return voucherRepository.findAvailableVouchers(LocalDateTime.now()).stream()
                .map(this::mapToVoucherResponse)
                .toList();
    }

    private void validateVoucherRequest(VoucherRequest request) {
        if (request.getStartDate() != null && request.getEndDate() != null) {
            if (request.getEndDate().isBefore(request.getStartDate())) {
                throw new BadRequestException("Ngày kết thúc phải sau ngày bắt đầu");
            }
        }

        if (request.getDiscountType() == DiscountType.PERCENTAGE) {
            if (request.getDiscountValue().compareTo(BigDecimal.ZERO) <= 0 || request.getDiscountValue().compareTo(BigDecimal.valueOf(100)) > 0) {
                throw new BadRequestException("Giá trị giảm giá theo phần trăm phải từ 1% đến 100%");
            }
        } else if (request.getDiscountType() == DiscountType.FIXED_AMOUNT) {
            if (request.getDiscountValue().compareTo(BigDecimal.ZERO) <= 0) {
                throw new BadRequestException("Số tiền giảm giá cố định phải lớn hơn 0");
            }
        }
    }

    public static BigDecimal calculateDiscount(Voucher voucher, BigDecimal subtotal) {
        BigDecimal discount = BigDecimal.ZERO;

        if (voucher.getDiscountType() == DiscountType.PERCENTAGE) {
            discount = subtotal.multiply(voucher.getDiscountValue())
                    .divide(BigDecimal.valueOf(100), 0, RoundingMode.HALF_UP);
            if (voucher.getMaxDiscountAmount() != null && discount.compareTo(voucher.getMaxDiscountAmount()) > 0) {
                discount = voucher.getMaxDiscountAmount();
            }
        } else if (voucher.getDiscountType() == DiscountType.FIXED_AMOUNT) {
            discount = voucher.getDiscountValue();
        }

        if (discount.compareTo(subtotal) > 0) {
            discount = subtotal;
        }

        return discount;
    }

    private VoucherResponse mapToVoucherResponse(Voucher voucher) {
        return new VoucherResponse(
                voucher.getId(),
                voucher.getCode(),
                voucher.getName(),
                voucher.getDescription(),
                voucher.getDiscountType(),
                voucher.getDiscountValue(),
                voucher.getMinOrderAmount(),
                voucher.getMaxDiscountAmount(),
                voucher.getStartDate(),
                voucher.getEndDate(),
                voucher.getMaxUsageCount(),
                voucher.getUsedCount(),
                voucher.getMaxUsagePerUser(),
                voucher.getStatus(),
                voucher.isExpired(),
                voucher.isAvailable(),
                voucher.getCreatedAt(),
                voucher.getUpdatedAt()
        );
    }
}
