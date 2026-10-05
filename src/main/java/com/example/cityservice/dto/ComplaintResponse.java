package com.example.cityservice.dto;

import java.time.Instant;
import java.util.List;
import java.util.Set;

import com.example.cityservice.model.Complaint;
import com.example.cityservice.model.Complaint.Priority;
import com.example.cityservice.model.Complaint.Status;
import com.example.cityservice.model.User;

/** Full complaint representation returned to authorised callers. */
public record ComplaintResponse(
        Long id,
        String referenceCode,
        String title,
        String description,
        String imageUrl,
        double latitude,
        double longitude,
        String district,
        String address,
        Priority priority,
        Status status,
        boolean closed,
        Set<Status> allowedTransitions,
        String resolutionNote,
        Instant resolvedAt,
        Instant createdAt,
        Instant updatedAt,
        Long categoryId,
        String categoryName,
        String departmentName,
        Long userId,
        String userName,
        String userFullName,
        Long assignedToId,
        String assignedToName,
        List<CommentResponse> comments) {

    /** Minimal user projection embedded in complaint payloads. */
    public record UserSummary(Long id, String username, String fullName, String phoneNumber, User.Role role) {

        public static UserSummary of(User user) {
            if (user == null) {
                return null;
            }
            return new UserSummary(user.getId(), user.getUsername(), user.getFullName(),
                    user.getPhoneNumber(), user.getRole());
        }
    }

    public record CommentResponse(
            Long id,
            String message,
            Status previousStatus,
            Status newStatus,
            boolean internal,
            Instant createdAt,
            UserSummary author) {
    }
}