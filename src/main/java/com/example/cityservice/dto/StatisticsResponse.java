package com.example.cityservice.dto;

import java.time.Instant;
import java.util.Map;

/** Aggregated numbers for the staff dashboard. */
public record StatisticsResponse(
        long total,
        long open,
        long closed,
        Map<String, Long> byStatus,
        Map<String, Long> byPriority,
        Map<String, Long> byCategory,
        Map<String, Long> byDistrict,
        double averageResolutionHours,
        Instant generatedAt) {
}