package com.example.cityservice.controller;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.Locale;
import java.util.UUID;

import com.example.cityservice.config.UploadStorageProperties;
import com.example.cityservice.dto.ErrorResponse;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

/** Accepts complaint photos and returns the URL to attach to a complaint. */
@RestController
@RequestMapping("/api/files")
public class FileController {

    private static final Logger log = LoggerFactory.getLogger(FileController.class);

    private final UploadStorageProperties properties;
    private final Path root;

    public FileController(UploadStorageProperties properties) {
        this.properties = properties;
        this.root = Paths.get(properties.uploadDir()).toAbsolutePath().normalize();
    }

    @PostMapping(value = "/image", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<?> upload(@RequestParam("file") MultipartFile file) {
        if (file.isEmpty()) {
            return ResponseEntity.badRequest()
                    .body(ErrorResponse.of(400, "Bad Request", "Fayl boşdur", "/api/files/image"));
        }
        if (file.getSize() > properties.maxImageSizeBytes()) {
            return ResponseEntity.status(HttpStatus.PAYLOAD_TOO_LARGE)
                    .body(ErrorResponse.of(413, "Payload Too Large",
                            "Fayl ölçüsü icazə verilən maksimumdan böyükdür", "/api/files/image"));
        }
        String contentType = file.getContentType();
        if (!properties.isAllowed(contentType)) {
            return ResponseEntity.badRequest()
                    .body(ErrorResponse.of(400, "Bad Request",
                            "Dəstəklənməyən fayl tipi: " + contentType, "/api/files/image"));
        }

        String extension = extensionFor(file.getOriginalFilename(), contentType);
        String storedName = UUID.randomUUID() + extension;

        try {
            Files.createDirectories(root);
            Path target = root.resolve(storedName).normalize();
            if (!target.startsWith(root)) {
                throw new IOException("Fayl yolu təhlükəlidir");
            }
            try (var in = file.getInputStream()) {
                Files.copy(in, target, StandardCopyOption.REPLACE_EXISTING);
            }
        } catch (IOException ex) {
            log.error("Şəkil yüklənmədi", ex);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ErrorResponse.of(500, "Internal Server Error",
                            "Fayl yüklənə bilmədi", "/api/files/image"));
        }

        return ResponseEntity.ok(new UploadResponse("/uploads/" + storedName, contentType, file.getSize()));
    }

    /** Replaces whatever extension the client sent with the one implied by the MIME type. */
    private static String extensionFor(String originalName, String contentType) {
        String fromType = switch (contentType == null ? "" : contentType.toLowerCase(Locale.ROOT)) {
            case "image/jpeg" -> ".jpg";
            case "image/png" -> ".png";
            case "image/webp" -> ".webp";
            case "image/gif" -> ".gif";
            default -> "";
        };
        if (!fromType.isEmpty()) {
            return fromType;
        }
        String name = originalName == null ? "" : originalName;
        int dot = name.lastIndexOf('.');
        return dot >= 0 && dot < name.length() - 1 ? name.substring(dot).toLowerCase(Locale.ROOT) : ".bin";
    }

    /** Upload result returned to the client. */
    public record UploadResponse(String url, String contentType, long size) {
    }
}