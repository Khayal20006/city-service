package com.example.cityservice.dto;

import java.time.Instant;

import com.example.cityservice.model.Category;

public record CategoryResponse(
        Long id,
        String name,
        String description,
        String departmentName,
        String contactEmail,
        int estimatedResolutionHours,
        boolean active,
        long openComplaints,
        Instant createdAt) {

    public static CategoryResponse of(Category category, long openComplaints) {
        return new CategoryResponse(
                category.getId(),
                category.getName(),
                category.getDescription(),
                category.getDepartmentName(),
                category.getContactEmail(),
                category.getEstimatedResolutionHours(),
                category.isActive(),
                openComplaints,
                category.getCreatedAt());
    }
}