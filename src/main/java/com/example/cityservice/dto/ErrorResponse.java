package com.example.cityservice.dto;

import java.time.Instant;
import java.util.List;

/**
 * Uniform error body. {@code details} carries field-level validation failures or the
 * allowed status transitions of a rejected request.
 */
public record ErrorResponse(
        Instant timestamp,
        int status,
        String error,
        String message,
        String path,
        List<String> details) {

    public static ErrorResponse of(int status, String error, String message, String path) {
        return new ErrorResponse(Instant.now(), status, error, message, path, null);
    }

    public static ErrorResponse of(int status, String error, String message, String path, List<String> details) {
        return new ErrorResponse(Instant.now(), status, error, message, path, details);
    }
}