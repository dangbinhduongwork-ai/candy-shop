package com.candyshop.service;

import com.candyshop.exception.BadRequestException;
import jakarta.annotation.PostConstruct;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.io.InputStream;
import java.nio.file.*;
import java.util.Arrays;
import java.util.List;
import java.util.UUID;

@Service
public class FileStorageServiceImpl implements FileStorageService {

    @Value("${app.upload.dir:uploads}")
    private String uploadDir;

    private Path uploadPath;

    private static final List<String> ALLOWED_EXTENSIONS = Arrays.asList(".jpg", ".jpeg", ".png", ".gif", ".webp");

    @PostConstruct
    public void init() {
        try {
            this.uploadPath = Paths.get(uploadDir).toAbsolutePath().normalize();
            Files.createDirectories(this.uploadPath);
        } catch (IOException e) {
            throw new RuntimeException("Could not initialize storage directory: " + uploadDir, e);
        }
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

        // Limit file size (e.g. 5MB)
        if (file.getSize() > 5 * 1024 * 1024) {
            throw new BadRequestException("Dung lượng file không được vượt quá 5MB");
        }

        String uniqueFileName = UUID.randomUUID().toString() + extension;
        Path targetLocation = this.uploadPath.resolve(uniqueFileName);

        try (InputStream inputStream = file.getInputStream()) {
            Files.copy(inputStream, targetLocation, StandardCopyOption.REPLACE_EXISTING);
            // Return web accessible relative path
            return "/uploads/" + uniqueFileName;
        } catch (IOException e) {
            throw new BadRequestException("Không thể lưu file ảnh: " + e.getMessage());
        }
    }

    @Override
    public void deleteFile(String fileUrlOrName) {
        if (fileUrlOrName == null || fileUrlOrName.isBlank()) {
            return;
        }
        try {
            String fileName = fileUrlOrName;
            if (fileName.startsWith("/uploads/")) {
                fileName = fileName.substring("/uploads/".length());
            }
            Path filePath = this.uploadPath.resolve(fileName).normalize();
            if (filePath.startsWith(this.uploadPath) && Files.exists(filePath)) {
                Files.delete(filePath);
            }
        } catch (IOException ignored) {
            // Ignore deletion errors on cleanup
        }
    }
}
