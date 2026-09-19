package com.candyshop.storage;

import com.candyshop.exception.BadRequestException;
import jakarta.annotation.PostConstruct;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.stereotype.Component;
import org.springframework.web.multipart.MultipartFile;

import javax.imageio.ImageIO;
import java.awt.Graphics2D;
import java.awt.RenderingHints;
import java.awt.image.BufferedImage;
import java.io.ByteArrayInputStream;
import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.io.InputStream;
import java.nio.file.*;

/**
 * Local Disk File Storage Provider with automatic image optimization & compression.
 */
@Component
public class LocalStorageProvider implements FileStorageProvider {

    private static final Logger log = LoggerFactory.getLogger(LocalStorageProvider.class);

    @Value("${app.upload.dir:uploads}")
    private String uploadDir;

    private Path uploadPath;

    @PostConstruct
    public void init() {
        try {
            this.uploadPath = Paths.get(uploadDir).toAbsolutePath().normalize();
            Files.createDirectories(this.uploadPath);
            log.info("Initialized LocalStorageProvider at path: {}", this.uploadPath);
        } catch (IOException e) {
            throw new RuntimeException("Could not initialize local storage directory: " + uploadDir, e);
        }
    }

    @Override
    public String store(MultipartFile file, String filename) {
        Path targetLocation = this.uploadPath.resolve(filename);

        try {
            // Attempt to compress and optimize image if it's a standard bitmap format
            String ext = filename.substring(filename.lastIndexOf('.') + 1).toLowerCase();
            if ("jpg".equals(ext) || "jpeg".equals(ext) || "png".equals(ext)) {
                try (InputStream in = file.getInputStream()) {
                    BufferedImage originalImage = ImageIO.read(in);
                    if (originalImage != null) {
                        BufferedImage optimizedImage = resizeAndOptimize(originalImage, 1600);
                        String formatName = "png".equals(ext) ? "png" : "jpeg";
                        ImageIO.write(optimizedImage, formatName, targetLocation.toFile());
                        return "/uploads/" + filename;
                    }
                } catch (Exception e) {
                    log.warn("Image optimization skipped for {}: {}", filename, e.getMessage());
                }
            }

            // Fallback: direct stream copy
            try (InputStream inputStream = file.getInputStream()) {
                Files.copy(inputStream, targetLocation, StandardCopyOption.REPLACE_EXISTING);
            }
            return "/uploads/" + filename;
        } catch (IOException e) {
            log.error("Failed to store file {}: {}", filename, e.getMessage());
            throw new BadRequestException("Không thể lưu file: " + e.getMessage());
        }
    }

    private BufferedImage resizeAndOptimize(BufferedImage src, int maxDimension) {
        int width = src.getWidth();
        int height = src.getHeight();

        if (width <= maxDimension && height <= maxDimension) {
            return src;
        }

        double ratio = (double) width / height;
        if (width > height) {
            width = maxDimension;
            height = (int) (maxDimension / ratio);
        } else {
            height = maxDimension;
            width = (int) (maxDimension * ratio);
        }

        BufferedImage resized = new BufferedImage(width, height,
                src.getType() == 0 ? BufferedImage.TYPE_INT_RGB : src.getType());
        Graphics2D g = resized.createGraphics();
        g.setRenderingHint(RenderingHints.KEY_INTERPOLATION, RenderingHints.VALUE_INTERPOLATION_BILINEAR);
        g.setRenderingHint(RenderingHints.KEY_RENDERING, RenderingHints.VALUE_RENDER_QUALITY);
        g.setRenderingHint(RenderingHints.KEY_ANTIALIASING, RenderingHints.VALUE_ANTIALIAS_ON);
        g.drawImage(src, 0, 0, width, height, null);
        g.dispose();

        return resized;
    }

    @Override
    public void delete(String fileUrl) {
        if (fileUrl == null || fileUrl.trim().isEmpty()) return;

        try {
            String filename = fileUrl;
            if (filename.startsWith("/uploads/")) {
                filename = filename.substring("/uploads/".length());
            } else if (filename.contains("/")) {
                filename = filename.substring(filename.lastIndexOf('/') + 1);
            }

            Path filePath = this.uploadPath.resolve(filename).normalize();
            if (Files.exists(filePath) && filePath.startsWith(this.uploadPath)) {
                Files.delete(filePath);
                log.debug("Deleted local file: {}", filePath);
            }
        } catch (Exception e) {
            log.warn("Failed to delete file {}: {}", fileUrl, e.getMessage());
        }
    }

    @Override
    public String getProviderName() {
        return "local";
    }
}
