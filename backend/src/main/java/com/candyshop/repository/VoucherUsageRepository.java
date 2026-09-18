package com.candyshop.repository;

import com.candyshop.entity.User;
import com.candyshop.entity.Voucher;
import com.candyshop.entity.VoucherUsage;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.util.List;

@Repository
public interface VoucherUsageRepository extends JpaRepository<VoucherUsage, Long> {

    long countByVoucherAndUser(Voucher voucher, User user);

    long countByVoucherId(Long voucherId);

    List<VoucherUsage> findByUserIdOrderByUsedAtDesc(Long userId);

    @Query("SELECT COALESCE(SUM(vu.discountAmount), 0) FROM VoucherUsage vu")
    BigDecimal sumTotalDiscountGiven();
}
