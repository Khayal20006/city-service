package com.example.cityservice.dto;

import java.time.Instant;

import com.example.cityservice.model.Complaint.Priority;
import com.example.cityservice.model.Complaint.Status;

/**
 * Filter bundle for the complaint search endpoint. Blank values are ignored so the
 * controller can pass request parameters straight through.
 */
public record SearchCriteria(
        Status status,
        Priority priority,
        Long categoryId,
        Long userId,
        Long assignedToId,
        Boolean mine,
        String district,
        String referenceCode,
        String text,
        Instant createdFrom,
        Instant createdTo) {

    public static SearchCriteria empty() {
        return new SearchCriteria(null, null, null, null, null, null, null, null, null, null, null);
    }

    public boolean hasStatus() {
        return status != null;
    }

    public boolean hasText() {
        return text != null && !text.isBlank();
    }

    /** Rejects ranges that cannot match anything, instead of silently returning no rows. */
    public boolean isDateRangeValid() {
        return createdFrom == null || createdTo == null || !createdFrom.isAfter(createdTo);
    }

    public static SearchCriteria of(Status status,
                                    Priority priority,
                                    Long categoryId,
                                    Long userId,
                                    Long assignedToId,
                                    Boolean mine,
                                    String district,
                                    String referenceCode,
                                    String text,
                                    Instant createdFrom,
                                    Instant createdTo) {
        return new SearchCriteria(status, priority, categoryId, userId, assignedToId, mine,
                district, referenceCode, text, createdFrom, createdTo);
    }
}