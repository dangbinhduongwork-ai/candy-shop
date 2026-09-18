package com.candyshop.controller;

import com.candyshop.dto.ShippingSettingDTO;
import com.candyshop.service.ShopSettingService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/admin/settings")
public class AdminShopSettingController {

    private final ShopSettingService shopSettingService;

    public AdminShopSettingController(ShopSettingService shopSettingService) {
        this.shopSettingService = shopSettingService;
    }

    @GetMapping("/shipping")
    public ResponseEntity<ShippingSettingDTO> getShippingSetting() {
        ShippingSettingDTO setting = shopSettingService.getShippingSetting();
        return ResponseEntity.ok(setting);
    }

    @PutMapping("/shipping")
    public ResponseEntity<ShippingSettingDTO> updateShippingSetting(
            @Valid @RequestBody ShippingSettingDTO request) {
        ShippingSettingDTO updated = shopSettingService.updateShippingSetting(request);
        return ResponseEntity.ok(updated);
    }
}
