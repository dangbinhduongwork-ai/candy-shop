package com.candyshop.storage;

import org.springframework.web.multipart.MultipartFile;

/**
 * Enterprise Pluggable Storage Provider Interface.
 * Allows seamless switching between Local Filesystem, AWS S3, MinIO, or Cloudinary.
 */
public interface FileStorageProvider {

    /**
     * Stores the given file and returns the accessible public URL or relative path.
     */
    String store(MultipartFile file, String filename);

    /**
     * Deletes the file by its stored path or URL.
     */
    void delete(String fileUrl);

    /**
     * Returns the identifier of this provider (e.g. "local", "s3", "cloudinary").
     */
    String getProviderName();
}
