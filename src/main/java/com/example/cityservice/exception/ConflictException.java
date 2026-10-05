package com.example.cityservice.exception;

/** Thrown when a request conflicts with existing data. Rendered as HTTP 409. */
public class ConflictException extends RuntimeException {

    public ConflictException(String message) {
        super(message);
    }
}