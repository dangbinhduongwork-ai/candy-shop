package com.candyshop.controller;

import com.candyshop.dto.ShippingSettingDTO;
import com.candyshop.dto.ShopGeneralSettingDTO;
import com.candyshop.service.FileStorageService;
import com.candyshop.service.ShopSettingService;
import jakarta.validation.Valid;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.Map;

@RestController
@RequestMapping("/api/admin/settings")
public class AdminShopSettingController {

    private final ShopSettingService shopSettingService;
    private final FileStorageService fileStorageService;

    public AdminShopSettingController(ShopSettingService shopSettingService, FileStorageService fileStorageService) {
        this.shopSettingService = shopSettingService;
        this.fileStorageService = fileStorageService;
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

    @GetMapping("/general")
    public ResponseEntity<ShopGeneralSettingDTO> getGeneralSetting() {
        ShopGeneralSettingDTO setting = shopSettingService.getGeneralSetting();
        return ResponseEntity.ok(setting);
    }

    @PutMapping("/general")
    public ResponseEntity<ShopGeneralSettingDTO> updateGeneralSetting(
            @RequestBody ShopGeneralSettingDTO request) {
        ShopGeneralSettingDTO updated = shopSettingService.updateGeneralSetting(request);
        return ResponseEntity.ok(updated);
    }

    @PostMapping(value = "/upload-background", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<Map<String, String>> uploadBackground(
            @RequestParam("image") MultipartFile image) {
        String imageUrl = fileStorageService.storeFile(image);
        return ResponseEntity.ok(Map.of("url", imageUrl));
    }
}

