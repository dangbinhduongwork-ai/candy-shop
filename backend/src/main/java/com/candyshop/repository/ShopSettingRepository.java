package com.candyshop.repository;

import com.candyshop.entity.ShopSetting;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface ShopSettingRepository extends JpaRepository<ShopSetting, Long> {

    Optional<ShopSetting> findBySettingKey(String settingKey);
}
