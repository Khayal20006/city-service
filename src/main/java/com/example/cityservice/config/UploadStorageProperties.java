package com.example.cityservice.config;

import org.springframework.boot.context.properties.ConfigurationProperties;

/**
 * Image upload limits bound from {@code city.storage.*}.
 *
 * @param uploadDir           directory the files are written to
 * @param maxImageSizeBytes   hard per-file limit enforced before reading the content
 * @param allowedImageTypes   comma-separated MIME types accepted by the API
 */
@ConfigurationProperties(prefix = "city.storage")
public record UploadStorageProperties(
        String uploadDir,
        long maxImageSizeBytes,
        String allowedImageTypes) {

    public UploadStorageProperties {
        if (uploadDir == null || uploadDir.isBlank()) {
            throw new IllegalArgumentException("city.storage.upload-dir boş ola bilməz");
        }
        if (maxImageSizeBytes <= 0) {
            throw new IllegalArgumentException("city.storage.max-image-size-bytes müsbət olmalıdır");
        }
    }

    public boolean isAllowed(String contentType) {
        if (contentType == null) {
            return false;
        }
        for (String allowed : allowedImageTypes.split(",")) {
            if (allowed.trim().equalsIgnoreCase(contentType)) {
                return true;
            }
        }
        return false;
    }
}