package com.example.cityservice.dto;

import java.time.Instant;

import com.example.cityservice.model.Complaint;
import com.example.cityservice.model.Complaint.Priority;
import com.example.cityservice.model.Complaint.Status;

/** Trimmed payload for the map view - no description, no personal data. */
public record ComplaintMarkerResponse(
        Long id,
        String referenceCode,
        String title,
        Status status,
        Priority priority,
        double latitude,
        double longitude,
        String district,
        String categoryName,
        Instant createdAt) {

    public static ComplaintMarkerResponse of(Complaint complaint) {
        return new ComplaintMarkerResponse(
                complaint.getId(),
                complaint.getReferenceCode(),
                complaint.getTitle(),
                complaint.getStatus(),
                complaint.getPriority(),
                complaint.getLatitude(),
                complaint.getLongitude(),
                complaint.getDistrict(),
                complaint.getCategory() == null ? null : complaint.getCategory().getName(),
                complaint.getCreatedAt());
    }
}