package com.candyshop.repository;

import com.candyshop.entity.Voucher;
import com.candyshop.entity.VoucherStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface VoucherRepository extends JpaRepository<Voucher, Long> {

    Optional<Voucher> findByCodeIgnoreCase(String code);

    boolean existsByCodeIgnoreCase(String code);

    @Query("SELECT v FROM Voucher v WHERE " +
           "(:status IS NULL OR v.status = :status) AND " +
           "(:search IS NULL OR LOWER(v.code) LIKE LOWER(CONCAT('%', :search, '%')) OR LOWER(v.name) LIKE LOWER(CONCAT('%', :search, '%')))")
    Page<Voucher> findVouchersWithFilter(
            @Param("status") VoucherStatus status,
            @Param("search") String search,
            Pageable pageable);

    @Query("SELECT v FROM Voucher v WHERE v.status = com.candyshop.entity.VoucherStatus.ACTIVE " +
           "AND v.startDate <= :now AND v.endDate >= :now " +
           "AND (v.maxUsageCount IS NULL OR v.usedCount < v.maxUsageCount) " +
           "ORDER BY v.createdAt DESC")
    List<Voucher> findAvailableVouchers(@Param("now") LocalDateTime now);
}
