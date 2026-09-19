package com.candyshop.controller;

import com.candyshop.dto.ShippingSettingDTO;
import com.candyshop.dto.ShopGeneralSettingDTO;
import com.candyshop.service.ShopSettingService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/settings")
public class ShopSettingController {

    private final ShopSettingService shopSettingService;

    public ShopSettingController(ShopSettingService shopSettingService) {
        this.shopSettingService = shopSettingService;
    }

    @GetMapping("/shipping")
    public ResponseEntity<ShippingSettingDTO> getShippingSetting() {
        ShippingSettingDTO setting = shopSettingService.getShippingSetting();
        return ResponseEntity.ok(setting);
    }

    @GetMapping("/general")
    public ResponseEntity<ShopGeneralSettingDTO> getGeneralSetting() {
        ShopGeneralSettingDTO setting = shopSettingService.getGeneralSetting();
        return ResponseEntity.ok(setting);
    }
}

