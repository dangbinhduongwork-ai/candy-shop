package com.candyshop.service;

import com.candyshop.dto.*;
import com.candyshop.entity.*;
import com.candyshop.exception.BadRequestException;
import com.candyshop.exception.ResourceNotFoundException;
import com.candyshop.repository.OrderRepository;
import com.candyshop.repository.ProductRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.*;

@Service
public class AdminOrderServiceImpl implements AdminOrderService {

    private final OrderRepository orderRepository;
    private final ProductRepository productRepository;
    private final com.candyshop.repository.VoucherRepository voucherRepository;
    private final com.candyshop.repository.VoucherUsageRepository voucherUsageRepository;

    public AdminOrderServiceImpl(OrderRepository orderRepository,
                                 ProductRepository productRepository,
                                 com.candyshop.repository.VoucherRepository voucherRepository,
                                 com.candyshop.repository.VoucherUsageRepository voucherUsageRepository) {
        this.orderRepository = orderRepository;
        this.productRepository = productRepository;
        this.voucherRepository = voucherRepository;
        this.voucherUsageRepository = voucherUsageRepository;
    }

    @Override
    @Transactional(readOnly = true)
    public PageResponse<OrderResponse> getAllOrders(OrderStatus status,
                                                    LocalDate startDate,
                                                    LocalDate endDate,
                                                    String search,
                                                    int page,
                                                    int size) {
        LocalDateTime startDateTime = startDate != null ? startDate.atStartOfDay() : null;
        LocalDateTime endDateTime = endDate != null ? endDate.atTime(LocalTime.MAX) : null;
        String searchParam = (search != null && !search.trim().isEmpty()) ? search.trim() : null;

        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt"));
        Page<Order> orderPage = orderRepository.findAllWithFilter(status, startDateTime, endDateTime, searchParam, pageable);

        List<OrderResponse> content = orderPage.getContent().stream()
                .map(this::mapToOrderResponse)
                .toList();

        return new PageResponse<>(
                content,
                orderPage.getNumber(),
                orderPage.getSize(),
                orderPage.getTotalElements(),
                orderPage.getTotalPages(),
                orderPage.isLast()
        );
    }

    @Override
    @Transactional(readOnly = true)
    public OrderResponse getOrderById(Long id) {
        Order order = orderRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy đơn hàng với ID: " + id));
        return mapToOrderResponse(order);
    }

    @Override
    @Transactional
    public OrderResponse updateOrderStatus(Long id, OrderStatus newStatus) {
        if (newStatus == null) {
            throw new BadRequestException("Trạng thái mới không được để trống");
        }

        Order order = orderRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy đơn hàng với ID: " + id));

        OrderStatus currentStatus = order.getStatus();

        if (currentStatus == newStatus) {
            throw new BadRequestException("Đơn hàng hiện tại đã ở trạng thái: " + currentStatus);
        }

        // Validate allowed state transitions
        boolean isValidTransition = false;
        if (currentStatus == OrderStatus.PENDING) {
            if (newStatus == OrderStatus.CONFIRMED || newStatus == OrderStatus.CANCELLED) {
                isValidTransition = true;
            }
        } else if (currentStatus == OrderStatus.CONFIRMED) {
            if (newStatus == OrderStatus.SHIPPING || newStatus == OrderStatus.CANCELLED) {
                isValidTransition = true;
            }
        } else if (currentStatus == OrderStatus.SHIPPING) {
            if (newStatus == OrderStatus.COMPLETED || newStatus == OrderStatus.CANCELLED) {
                isValidTransition = true;
            }
        } else if (currentStatus == OrderStatus.COMPLETED) {
            throw new BadRequestException("Đơn hàng đã hoàn thành, không thể thay đổi trạng thái nữa.");
        } else if (currentStatus == OrderStatus.CANCELLED) {
            throw new BadRequestException("Đơn hàng đã bị huỷ, không thể thay đổi trạng thái nữa.");
        }

        if (!isValidTransition) {
            throw new BadRequestException("Không thể chuyển trạng thái từ " + currentStatus + " sang " + newStatus
                    + ". Luồng hợp lệ: PENDING -> CONFIRMED -> SHIPPING -> COMPLETED (hoặc CANCELLED từ PENDING/CONFIRMED/SHIPPING).");
        }

        // If cancelled, restore stock quantities and revert voucher usage
        if (newStatus == OrderStatus.CANCELLED) {
            if (order.getItems() != null) {
                for (OrderItem item : order.getItems()) {
                    Product product = item.getProduct();
                    if (product != null) {
                        int currentStock = product.getStockQuantity() != null ? product.getStockQuantity() : 0;
                        product.setStockQuantity(currentStock + item.getQuantity());
                        productRepository.save(product);
                    }
                }
            }

            List<VoucherUsage> usages = voucherUsageRepository.findByOrderId(order.getId());
            for (VoucherUsage usage : usages) {
                Voucher voucher = usage.getVoucher();
                if (voucher != null && voucher.getUsedCount() != null && voucher.getUsedCount() > 0) {
                    voucher.setUsedCount(voucher.getUsedCount() - 1);
                    voucherRepository.save(voucher);
                }
                voucherUsageRepository.delete(usage);
            }
        }

        order.setStatus(newStatus);
        Order updated = orderRepository.save(order);
        return mapToOrderResponse(updated);
    }

    @Override
    @Transactional(readOnly = true)
    public AdminOrderStatsResponse getOrderStats() {
        long totalOrders = orderRepository.count();
        BigDecimal totalRevenue = orderRepository.sumCompletedRevenue();

        Map<String, Long> countByStatus = new LinkedHashMap<>();
        for (OrderStatus st : OrderStatus.values()) {
            countByStatus.put(st.name(), 0L);
        }

        List<Object[]> statusCounts = orderRepository.countOrdersByStatus();
        if (statusCounts != null) {
            for (Object[] row : statusCounts) {
                if (row[0] instanceof OrderStatus st) {
                    Long count = ((Number) row[1]).longValue();
                    countByStatus.put(st.name(), count);
                }
            }
        }

        long lowStockCount = productRepository.countLowStockProducts();

        return new AdminOrderStatsResponse(totalOrders, totalRevenue, countByStatus, lowStockCount);
    }

    private OrderResponse mapToOrderResponse(Order order) {
        List<OrderItemResponse> itemResponses = new ArrayList<>();

        if (order.getItems() != null) {
            for (OrderItem item : order.getItems()) {
                Product p = item.getProduct();
                String categoryName = (p != null && p.getCategory() != null) ? p.getCategory().getName() : "";

                itemResponses.add(new OrderItemResponse(
                        item.getId(),
                        p != null ? p.getId() : null,
                        p != null ? p.getName() : "Sản phẩm",
                        p != null ? p.getImageUrl() : null,
                        categoryName,
                        item.getQuantity(),
                        item.getPriceAtOrder(),
                        item.getSubtotal()
                ));
            }
        }

        return new OrderResponse(
                order.getId(),
                order.getOrderCode(),
                order.getUser() != null ? order.getUser().getId() : null,
                order.getUser() != null ? order.getUser().getEmail() : null,
                order.getReceiverName(),
                order.getReceiverPhone(),
                order.getShippingAddress(),
                order.getNote(),
                order.getTotalAmount(),
                order.getPaymentMethod(),
                order.getStatus(),
                order.getVoucherCode(),
                order.getDiscountAmount(),
                order.getShippingFee(),
                itemResponses,
                order.getCreatedAt(),
                order.getUpdatedAt()
        );
    }
}
