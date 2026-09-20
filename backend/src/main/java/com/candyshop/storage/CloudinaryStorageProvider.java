package com.candyshop.storage;

import com.candyshop.exception.BadRequestException;
import com.cloudinary.Cloudinary;
import com.cloudinary.utils.ObjectUtils;
import jakarta.annotation.PostConstruct;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.Map;

/**
 * Enterprise Cloudinary Cloud Object Storage Provider.
 * Stores images permanently in the cloud with CDN acceleration.
 */
@Component
public class CloudinaryStorageProvider implements FileStorageProvider {

    private static final Logger log = LoggerFactory.getLogger(CloudinaryStorageProvider.class);

    @Value("${CLOUDINARY_URL:${app.storage.cloudinary.url:}}")
    private String cloudinaryUrl;

    @Value("${CLOUDINARY_CLOUD_NAME:${app.storage.cloudinary.cloud-name:}}")
    private String cloudName;

    @Value("${CLOUDINARY_API_KEY:${app.storage.cloudinary.api-key:}}")
    private String apiKey;

    @Value("${CLOUDINARY_API_SECRET:${app.storage.cloudinary.api-secret:}}")
    private String apiSecret;

    private Cloudinary cloudinary;

    @PostConstruct
    public void init() {
        try {
            if (cloudinaryUrl != null && !cloudinaryUrl.isBlank()) {
                String cleanUrl = cloudinaryUrl.trim();
                if (cleanUrl.startsWith("CLOUDINARY_URL=")) {
                    cleanUrl = cleanUrl.substring("CLOUDINARY_URL=".length()).trim();
                }
                this.cloudinary = new Cloudinary(cleanUrl);
                log.info("Initialized CloudinaryStorageProvider via CLOUDINARY_URL");
            } else if (cloudName != null && !cloudName.isBlank()
                    && apiKey != null && !apiKey.isBlank()
                    && apiSecret != null && !apiSecret.isBlank()) {
                this.cloudinary = new Cloudinary(ObjectUtils.asMap(
                        "cloud_name", cloudName.trim(),
                        "api_key", apiKey.trim(),
                        "api_secret", apiSecret.trim(),
                        "secure", true
                ));
                log.info("Initialized CloudinaryStorageProvider for cloud_name: {}", cloudName);
            } else {
                log.info("CloudinaryStorageProvider loaded (waiting for credentials in environment)");
            }
        } catch (Exception e) {
            log.warn("Failed to initialize Cloudinary: {}", e.getMessage());
        }
    }

    @Override
    public String store(MultipartFile file, String filename) {
        if (this.cloudinary == null) {
            init();
        }
        if (this.cloudinary == null) {
            throw new BadRequestException("Chưa cấu hình Cloudinary (vui lòng thêm CLOUDINARY_URL hoặc CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET)");
        }

        try {
            String publicId = filename;
            int dotIdx = publicId.lastIndexOf('.');
            if (dotIdx > 0) {
                publicId = publicId.substring(0, dotIdx);
            }

            @SuppressWarnings("rawtypes")
            Map uploadResult = cloudinary.uploader().upload(file.getBytes(), ObjectUtils.asMap(
                    "folder", "candy-shop",
                    "public_id", publicId,
                    "resource_type", "auto",
                    "overwrite", true
            ));

            String secureUrl = (String) uploadResult.get("secure_url");
            log.info("Uploaded image to Cloudinary successfully: {}", secureUrl);
            return secureUrl;
        } catch (IOException e) {
            log.error("Failed to upload image to Cloudinary: {}", e.getMessage(), e);
            throw new BadRequestException("Không thể upload ảnh lên Cloudinary: " + e.getMessage());
        }
    }

    @Override
    public void delete(String fileUrl) {
        if (fileUrl == null || !fileUrl.contains("res.cloudinary.com")) {
            return;
        }
        if (this.cloudinary == null) {
            init();
        }
        if (this.cloudinary == null) {
            return;
        }

        try {
            int folderIdx = fileUrl.indexOf("candy-shop/");
            if (folderIdx > 0) {
                String path = fileUrl.substring(folderIdx);
                int extIdx = path.lastIndexOf('.');
                String publicId = extIdx > 0 ? path.substring(0, extIdx) : path;
                cloudinary.uploader().destroy(publicId, ObjectUtils.emptyMap());
                log.info("Deleted image from Cloudinary: {}", publicId);
            }
        } catch (Exception e) {
            log.warn("Failed to delete asset from Cloudinary: {}", e.getMessage());
        }
    }

    @Override
    public String getProviderName() {
        return "cloudinary";
    }
}
