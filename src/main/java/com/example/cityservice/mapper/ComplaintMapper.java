package com.example.cityservice.mapper;

import java.util.List;

import com.example.cityservice.dto.ComplaintResponse;
import com.example.cityservice.dto.ComplaintResponse.CommentResponse;
import com.example.cityservice.dto.ComplaintResponse.UserSummary;
import com.example.cityservice.model.Complaint;
import com.example.cityservice.model.ComplaintComment;
import com.example.cityservice.model.User;
import org.springframework.stereotype.Component;

/** Entity to DTO translation for complaints. Keeps entity internals out of the API. */
@Component
public class ComplaintMapper {

    public ComplaintResponse toResponse(Complaint complaint, List<ComplaintComment> comments) {
        return new ComplaintResponse(
                complaint.getId(),
                complaint.getReferenceCode(),
                complaint.getTitle(),
                complaint.getDescription(),
                complaint.getImageUrl(),
                complaint.getLatitude(),
                complaint.getLongitude(),
                complaint.getDistrict(),
                complaint.getAddress(),
                complaint.getPriority(),
                complaint.getStatus(),
                complaint.isClosed(),
                complaint.allowedTransitions(),
                complaint.getResolutionNote(),
                complaint.getResolvedAt(),
                complaint.getCreatedAt(),
                complaint.getUpdatedAt(),
                complaint.getCategory() == null ? null : complaint.getCategory().getId(),
                complaint.getCategory() == null ? null : complaint.getCategory().getName(),
                complaint.getCategory() == null ? null : complaint.getCategory().getDepartmentName(),
                complaint.getUser() == null ? null : complaint.getUser().getId(),
                complaint.getUser() == null ? null : complaint.getUser().getUsername(),
                complaint.getUser() == null ? null : complaint.getUser().getDisplayName(),
                complaint.getAssignedTo() == null ? null : complaint.getAssignedTo().getId(),
                complaint.getAssignedTo() == null ? null : complaint.getAssignedTo().getDisplayName(),
                comments == null ? List.of() : comments.stream().map(this::toCommentResponse).toList());
    }

    public CommentResponse toCommentResponse(ComplaintComment comment) {
        return new CommentResponse(
                comment.getId(),
                comment.getMessage(),
                comment.getPreviousStatus(),
                comment.getNewStatus(),
                comment.isInternal(),
                comment.getCreatedAt(),
                UserSummary.of(comment.getAuthor()));
    }

    /** Compact projection used when only the author is needed. */
    public UserSummary toUserSummary(User user) {
        return UserSummary.of(user);
    }
}