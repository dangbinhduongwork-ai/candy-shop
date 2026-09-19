package com.candyshop.service;

import com.candyshop.exception.BadRequestException;
import com.candyshop.storage.FileStorageProvider;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;
import org.springframework.web.multipart.MultipartFile;

import java.util.Arrays;
import java.util.List;
import java.util.UUID;

@Service
public class FileStorageServiceImpl implements FileStorageService {

    private final List<FileStorageProvider> providers;

    @Value("${app.storage.provider:local}")
    private String activeProviderName;

    private static final List<String> ALLOWED_EXTENSIONS = Arrays.asList(".jpg", ".jpeg", ".png", ".gif", ".webp");

    public FileStorageServiceImpl(List<FileStorageProvider> providers) {
        this.providers = providers;
    }

    private FileStorageProvider getActiveProvider() {
        return providers.stream()
                .filter(p -> p.getProviderName().equalsIgnoreCase(activeProviderName))
                .findFirst()
                .orElseGet(() -> providers.stream()
                        .filter(p -> "local".equalsIgnoreCase(p.getProviderName()))
                        .findFirst()
                        .orElseThrow(() -> new IllegalStateException("No storage provider available")));
    }

    @Override
    public String storeFile(MultipartFile file) {
        if (file == null || file.isEmpty()) {
            throw new BadRequestException("File ảnh không được để trống");
        }

        String originalFilename = StringUtils.cleanPath(file.getOriginalFilename() != null ? file.getOriginalFilename() : "image.jpg");

        // Validate extension
        String extension = "";
        int dotIndex = originalFilename.lastIndexOf('.');
        if (dotIndex > 0) {
            extension = originalFilename.substring(dotIndex).toLowerCase();
        }

        if (!ALLOWED_EXTENSIONS.contains(extension)) {
            throw new BadRequestException("Định dạng file không được hỗ trợ. Chỉ chấp nhận các định dạng: " + String.join(", ", ALLOWED_EXTENSIONS));
        }

        // Limit file size (5MB)
        if (file.getSize() > 5 * 1024 * 1024) {
            throw new BadRequestException("Dung lượng file không được vượt quá 5MB");
        }

        String uniqueFileName = UUID.randomUUID().toString() + extension;
        return getActiveProvider().store(file, uniqueFileName);
    }

    @Override
    public void deleteFile(String fileUrlOrName) {
        if (fileUrlOrName == null || fileUrlOrName.isBlank()) {
            return;
        }
        getActiveProvider().delete(fileUrlOrName);
    }
}

