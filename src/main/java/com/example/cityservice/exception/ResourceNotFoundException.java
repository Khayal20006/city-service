package com.example.cityservice.exception;

/** Thrown when a referenced entity does not exist. Rendered as HTTP 404. */
public class ResourceNotFoundException extends RuntimeException {

    private ResourceNotFoundException(String message) {
        super(message);
    }

    public static ResourceNotFoundException of(String resource, Object id) {
        return new ResourceNotFoundException(resource + " tapılmadı: " + id);
    }

    public static ResourceNotFoundException because(String message) {
        return new ResourceNotFoundException(message);
    }
}