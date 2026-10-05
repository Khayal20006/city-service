package com.example.cityservice.exception;

import java.util.List;

/**
 * Raised when a business rule rejects an otherwise well-formed request, e.g. an illegal
 * status transition. Details carry the allowed values so the UI can grey out buttons.
 */
public class InvalidStateTransitionException extends RuntimeException {

    private final List<String> allowed;

    public InvalidStateTransitionException(String message, List<String> allowed) {
        super(message);
        this.allowed = allowed == null ? List.of() : List.copyOf(allowed);
    }

    public List<String> getAllowed() {
        return allowed;
    }
}