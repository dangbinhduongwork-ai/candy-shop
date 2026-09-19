package com.candyshop.service;

import com.candyshop.dto.*;
import com.candyshop.entity.*;
import com.candyshop.exception.BadRequestException;
import com.candyshop.exception.ResourceNotFoundException;
import com.candyshop.repository.*;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.List;
import java.util.Random;

@Service
public class OrderServiceImpl implements OrderService {

    private final OrderRepository orderRepository;
    private final OrderItemRepository orderItemRepository;
    private final CartRepository cartRepository;
    private final ProductRepository productRepository;
    private final UserRepository userRepository;
    private final VoucherRepository voucherRepository;
    private final VoucherUsageRepository voucherUsageRepository;
    private final ShopSettingService shopSettingService;

    public OrderServiceImpl(OrderRepository orderRepository,
                            OrderItemRepository orderItemRepository,
                            CartRepository cartRepository,
                            ProductRepository productRepository,
                            UserRepository userRepository,
                            VoucherRepository voucherRepository,
                            VoucherUsageRepository voucherUsageRepository,
                            ShopSettingService shopSettingService) {
        this.orderRepository = orderRepository;
        this.orderItemRepository = orderItemRepository;
        this.cartRepository = cartRepository;
        this.productRepository = productRepository;
        this.userRepository = userRepository;
        this.voucherRepository = voucherRepository;
        this.voucherUsageRepository = voucherUsageRepository;
        this.shopSettingService = shopSettingService;
    }

    @org.springframework.beans.factory.annotation.Autowired(required = false)
    private org.springframework.data.redis.core.StringRedisTemplate stringRedisTemplate;

    private final java.util.concurrent.atomic.AtomicLong fallbackSequence =
            new java.util.concurrent.atomic.AtomicLong(System.currentTimeMillis() % 10000);

    private String generateOrderCode() {
        String datePart = LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyyMMdd"));
        long seq = 0;
        if (stringRedisTemplate != null) {
            try {
                String key = "order:seq:" + datePart;
                Long val = stringRedisTemplate.opsForValue().increment(key);
                if (val != null && val == 1L) {
                    stringRedisTemplate.expire(key, java.time.Duration.ofDays(2));
                }
                if (val != null) {
                    seq = val;
                }
            } catch (Exception e) {
                seq = fallbackSequence.incrementAndGet();
            }
        } else {
            seq = fallbackSequence.incrementAndGet();
        }
        return String.format("ORD-%s-%04d", datePart, seq % 1000000);
    }

    @Override
    @Transactional
    public OrderResponse createOrder(String email, CreateOrderRequest request) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy người dùng với email: " + email));

        Cart cart = cartRepository.findByUserEmail(email)
                .orElseThrow(() -> new BadRequestException("Giỏ hàng của bạn đang trống"));

        if (cart.getItems() == null || cart.getItems().isEmpty()) {
            throw new BadRequestException("Giỏ hàng của bạn đang trống! Vui lòng chọn sản phẩm trước khi đặt hàng.");
        }

        // 1. Validate stock and prepare order items
        List<OrderItem> orderItems = new ArrayList<>();
        BigDecimal totalAmount = BigDecimal.ZERO;

        Order order = new Order(
                generateOrderCode(),
                user,
                request.getReceiverName().trim(),
                request.getReceiverPhone().trim(),
                request.getShippingAddress().trim(),
                request.getNote() != null ? request.getNote().trim() : null,
                BigDecimal.ZERO, // will set calculated total below
                request.getPaymentMethod() != null ? request.getPaymentMethod() : "COD",
                OrderStatus.PENDING
        );

        for (CartItem cartItem : cart.getItems()) {
            // Re-fetch product with pessimistic write lock to prevent race conditions / overselling
            Product product = productRepository.findByIdWithLock(cartItem.getProduct().getId())
                    .orElseThrow(() -> new ResourceNotFoundException("Sản phẩm không tồn tại: ID " + cartItem.getProduct().getId()));

            int requestedQty = cartItem.getQuantity();

            if (product.getStockQuantity() == null || product.getStockQuantity() < requestedQty) {
                throw new BadRequestException("Sản phẩm \"" + product.getName() + "\" không đủ số lượng tồn kho (chỉ còn "
                        + (product.getStockQuantity() == null ? 0 : product.getStockQuantity())
                        + " sản phẩm, bạn đang yêu cầu " + requestedQty + " cái)");
            }

            // Deduct stock
            product.setStockQuantity(product.getStockQuantity() - requestedQty);
            productRepository.save(product);

            // Record snapshot price at the time of order
            BigDecimal priceAtOrder = product.getPrice() != null ? product.getPrice() : BigDecimal.ZERO;
            BigDecimal subtotal = priceAtOrder.multiply(BigDecimal.valueOf(requestedQty));
            totalAmount = totalAmount.add(subtotal);

            OrderItem orderItem = new OrderItem(order, product, requestedQty, priceAtOrder, subtotal);
            order.addItem(orderItem);
        }

        // 2. Validate and apply voucher if requested
        BigDecimal discountAmount = BigDecimal.ZERO;
        String voucherCode = null;
        Voucher voucherToUpdate = null;

        if (request.getVoucherCode() != null && !request.getVoucherCode().trim().isEmpty()) {
            final String appliedCode = request.getVoucherCode().trim().toUpperCase();
            Voucher voucher = voucherRepository.findByCodeIgnoreCase(appliedCode)
                    .orElseThrow(() -> new BadRequestException("Mã giảm giá '" + appliedCode + "' không tồn tại"));

            if (voucher.getStatus() != VoucherStatus.ACTIVE) {
                throw new BadRequestException("Mã giảm giá '" + appliedCode + "' hiện đã ngừng áp dụng");
            }

            LocalDateTime now = LocalDateTime.now();
            if (voucher.getStartDate() != null && now.isBefore(voucher.getStartDate())) {
                throw new BadRequestException("Mã giảm giá '" + appliedCode + "' chưa đến thời gian áp dụng");
            }

            if (voucher.getEndDate() != null && now.isAfter(voucher.getEndDate())) {
                throw new BadRequestException("Mã giảm giá '" + appliedCode + "' đã hết hạn sử dụng");
            }

            if (voucher.getMaxUsageCount() != null && voucher.getUsedCount() >= voucher.getMaxUsageCount()) {
                throw new BadRequestException("Mã giảm giá '" + appliedCode + "' đã hết lượt sử dụng");
            }

            if (voucher.getMaxUsagePerUser() != null) {
                long userUsageCount = voucherUsageRepository.countByVoucherAndUser(voucher, user);
                if (userUsageCount >= voucher.getMaxUsagePerUser()) {
                    throw new BadRequestException("Bạn đã sử dụng hết số lần cho phép của mã giảm giá '" + appliedCode + "'");
                }
            }

            if (voucher.getMinOrderAmount() != null && totalAmount.compareTo(voucher.getMinOrderAmount()) < 0) {
                throw new BadRequestException(String.format("Đơn hàng tối thiểu phải từ %,dđ để áp dụng mã giảm giá này",
                        voucher.getMinOrderAmount().longValue()));
            }

            discountAmount = VoucherServiceImpl.calculateDiscount(voucher, totalAmount);
            voucherCode = appliedCode;
            voucherToUpdate = voucher;
        }

        BigDecimal subtotalAfterDiscount = totalAmount.subtract(discountAmount);
        if (subtotalAfterDiscount.compareTo(BigDecimal.ZERO) < 0) {
            subtotalAfterDiscount = BigDecimal.ZERO;
        }

        BigDecimal shippingFee = shopSettingService.calculateShippingFee(subtotalAfterDiscount);
        BigDecimal finalTotal = subtotalAfterDiscount.add(shippingFee);

        order.setTotalAmount(finalTotal);
        order.setVoucherCode(voucherCode);
        order.setDiscountAmount(discountAmount);
        order.setShippingFee(shippingFee);
        Order savedOrder = orderRepository.save(order);

        // 3. Record voucher usage and increment used count
        if (voucherToUpdate != null) {
            voucherToUpdate.setUsedCount(voucherToUpdate.getUsedCount() + 1);
            voucherRepository.save(voucherToUpdate);

            VoucherUsage usage = new VoucherUsage(voucherToUpdate, user, savedOrder, discountAmount);
            voucherUsageRepository.save(usage);
        }

        // 4. Clear user's shopping cart
        cart.clearItems();
        cartRepository.save(cart);

        return mapToOrderResponse(savedOrder);
    }

    @Override
    @Transactional(readOnly = true)
    public PageResponse<OrderResponse> getUserOrders(String email, int page, int size) {
        Pageable pageable = PageRequest.of(page, size);
        Page<Order> orderPage = orderRepository.findByUserEmailOrderByCreatedAtDesc(email, pageable);

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
    public OrderResponse getOrderById(String email, Long id) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy người dùng với email: " + email));

        Order order;
        if (user.getRole() == Role.ROLE_ADMIN) {
            order = orderRepository.findById(id)
                    .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy đơn hàng với ID: " + id));
        } else {
            order = orderRepository.findByIdAndUserEmail(id, email)
                    .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy đơn hàng hoặc bạn không có quyền xem đơn hàng này"));
        }

        return mapToOrderResponse(order);
    }

    @Override
    @Transactional
    public OrderResponse cancelOrder(String email, Long id) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy người dùng với email: " + email));

        Order order;
        if (user.getRole() == Role.ROLE_ADMIN) {
            order = orderRepository.findById(id)
                    .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy đơn hàng với ID: " + id));
        } else {
            order = orderRepository.findByIdAndUserEmail(id, email)
                    .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy đơn hàng của bạn"));
        }

        if (order.getStatus() != OrderStatus.PENDING) {
            throw new BadRequestException("Chỉ có thể huỷ đơn hàng khi đơn còn ở trạng thái Chờ xác nhận (PENDING). Trạng thái hiện tại: " + order.getStatus());
        }

        // Restore stock quantities
        if (order.getItems() != null) {
            for (OrderItem item : order.getItems()) {
                Product product = item.getProduct();
                if (product != null) {
                    int restoredQty = (product.getStockQuantity() != null ? product.getStockQuantity() : 0) + item.getQuantity();
                    product.setStockQuantity(restoredQty);
                    productRepository.save(product);
                }
            }
        }

        // Revert voucher usage if applied
        List<VoucherUsage> usages = voucherUsageRepository.findByOrderId(order.getId());
        for (VoucherUsage usage : usages) {
            Voucher voucher = usage.getVoucher();
            if (voucher != null && voucher.getUsedCount() != null && voucher.getUsedCount() > 0) {
                voucher.setUsedCount(voucher.getUsedCount() - 1);
                voucherRepository.save(voucher);
            }
            voucherUsageRepository.delete(usage);
        }

        order.setStatus(OrderStatus.CANCELLED);
        Order updatedOrder = orderRepository.save(order);

        return mapToOrderResponse(updatedOrder);
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
