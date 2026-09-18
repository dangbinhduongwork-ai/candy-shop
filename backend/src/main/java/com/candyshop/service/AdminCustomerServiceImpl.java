package com.candyshop.service;

import com.candyshop.dto.*;
import com.candyshop.entity.*;
import com.candyshop.exception.BadRequestException;
import com.candyshop.exception.ResourceNotFoundException;
import com.candyshop.repository.OrderRepository;
import com.candyshop.repository.UserRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.time.YearMonth;
import java.util.ArrayList;
import java.util.List;

@Service
public class AdminCustomerServiceImpl implements AdminCustomerService {

    private final UserRepository userRepository;
    private final OrderRepository orderRepository;

    public AdminCustomerServiceImpl(UserRepository userRepository,
                                    OrderRepository orderRepository) {
        this.userRepository = userRepository;
        this.orderRepository = orderRepository;
    }

    @Override
    @Transactional(readOnly = true)
    public Page<CustomerSummaryResponse> getCustomers(String search, UserStatus status, Pageable pageable) {
        String query = (search != null && !search.isBlank()) ? search.trim() : null;
        Page<User> customerPage = userRepository.findCustomersWithFilter(status, query, pageable);

        return customerPage.map(this::mapToCustomerSummary);
    }

    @Override
    @Transactional(readOnly = true)
    public CustomerDetailResponse getCustomerById(Long id) {
        User user = userRepository.findByIdAndRole(id, Role.ROLE_USER)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy khách hàng với ID: " + id));

        long totalOrders = orderRepository.countByUserId(user.getId());
        BigDecimal totalSpent = orderRepository.sumCompletedSpendingByUserId(user.getId());
        List<Order> recentOrdersList = orderRepository.findTop10ByUserIdOrderByCreatedAtDesc(user.getId());

        List<OrderResponse> recentOrderResponses = recentOrdersList.stream()
                .map(this::mapToOrderResponse)
                .toList();

        return new CustomerDetailResponse(
                user.getId(),
                user.getFullName(),
                user.getEmail(),
                user.getPhone(),
                user.getAddress(),
                user.getAvatarUrl(),
                user.getStatus(),
                user.getCreatedAt(),
                user.getUpdatedAt(),
                totalOrders,
                totalSpent,
                recentOrderResponses
        );
    }

    @Override
    @Transactional
    public CustomerSummaryResponse updateCustomerStatus(Long id, UserStatus newStatus) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy người dùng với ID: " + id));

        if (user.getRole() == Role.ROLE_ADMIN) {
            throw new BadRequestException("Không thể khóa hoặc thay đổi trạng thái của tài khoản Quản trị viên (Admin).");
        }

        user.setStatus(newStatus);
        User savedUser = userRepository.save(user);

        return mapToCustomerSummary(savedUser);
    }

    @Override
    @Transactional(readOnly = true)
    public CustomerStatsResponse getCustomerStats() {
        long totalCustomers = userRepository.countByRole(Role.ROLE_USER);
        LocalDateTime startOfMonth = YearMonth.now().atDay(1).atStartOfDay();
        long newCustomersThisMonth = userRepository.countByRoleAndCreatedAtGreaterThanEqual(Role.ROLE_USER, startOfMonth);
        long activeCustomers = userRepository.countByRoleAndStatus(Role.ROLE_USER, UserStatus.ACTIVE);
        long lockedCustomers = userRepository.countByRoleAndStatus(Role.ROLE_USER, UserStatus.LOCKED);

        List<Object[]> topRows = orderRepository.findTopSpenders(PageRequest.of(0, 5));
        List<CustomerStatsResponse.TopSpenderDTO> topSpenders = new ArrayList<>();

        for (Object[] row : topRows) {
            Long id = (Long) row[0];
            String fullName = (String) row[1];
            String email = (String) row[2];
            String phone = (String) row[3];
            String avatarUrl = (String) row[4];
            long orderCount = ((Number) row[5]).longValue();
            BigDecimal totalSpent = (BigDecimal) row[6];

            topSpenders.add(new CustomerStatsResponse.TopSpenderDTO(
                    id, fullName, email, phone, avatarUrl, orderCount, totalSpent
            ));
        }

        return new CustomerStatsResponse(
                totalCustomers,
                newCustomersThisMonth,
                activeCustomers,
                lockedCustomers,
                topSpenders
        );
    }

    private CustomerSummaryResponse mapToCustomerSummary(User user) {
        long totalOrders = orderRepository.countByUserId(user.getId());
        BigDecimal totalSpent = orderRepository.sumCompletedSpendingByUserId(user.getId());

        return new CustomerSummaryResponse(
                user.getId(),
                user.getFullName(),
                user.getEmail(),
                user.getPhone(),
                user.getAddress(),
                user.getAvatarUrl(),
                user.getStatus(),
                user.getCreatedAt(),
                totalOrders,
                totalSpent
        );
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
