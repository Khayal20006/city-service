package com.example.cityservice.repository;

import java.util.List;

import com.example.cityservice.model.Complaint;
import com.example.cityservice.model.ComplaintComment;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ComplaintCommentRepository extends JpaRepository<ComplaintComment, Long> {

    List<ComplaintComment> findByComplaintIdOrderByCreatedAtAsc(Long complaintId);

    List<ComplaintComment> findByComplaintIdAndInternalFalseOrderByCreatedAtAsc(Long complaintId);

    long countByComplaintIdAndInternalTrue(Long complaintId);
}