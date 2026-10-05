package com.example.cityservice.repository;

import java.time.Instant;
import java.util.List;
import java.util.Optional;

import com.example.cityservice.model.Complaint;
import com.example.cityservice.model.Complaint.Priority;
import com.example.cityservice.model.Complaint.Status;
import jakarta.persistence.LockModeType;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface ComplaintRepository extends JpaRepository<Complaint, Long>, JpaSpecificationExecutor<Complaint> {

    /**
     * Reserves the next complaint reference number. Consumes a value even when the
     * surrounding transaction is rolled back, which is intentional: gaps in the sequence
     * are harmless, duplicate references are not.
     */
    @Query(value = "select nextval('complaint_reference_seq')", nativeQuery = true)
    long nextReferenceNumber();

    Optional<Complaint> findByReferenceCode(String referenceCode);

    List<Complaint> findByUserIdOrderByCreatedAtDesc(Long userId);

    Page<Complaint> findByUserId(Long userId, Pageable pageable);

    List<Complaint> findByStatusOrderByCreatedAtDesc(Status status);

    List<Complaint> findByCategoryIdOrderByCreatedAtDesc(Long categoryId);

    List<Complaint> findByAssignedToIdOrderByCreatedAtDesc(Long assignedToId);

    long countByStatus(Status status);

    long countByStatusIn(List<Status> statuses);

    long countByCategoryId(Long categoryId);

    long countByUserId(Long userId);

    long countByUserIdAndStatusIn(Long userId, List<Status> statuses);

    long countByCategoryIdAndStatusIn(Long categoryId, List<Status> statuses);

    long countByPriority(Priority priority);

    long countByDistrictIgnoreCase(String district);

    List<Complaint> findByCreatedAtBetweenOrderByCreatedAtAsc(Instant from, Instant to);

    @Query("select c.district, count(c) from Complaint c "
            + "where c.district is not null and c.district <> '' "
            + "group by c.district order by count(c) desc")
    List<Object[]> countByDistrict();

    @Query("select c.category.name, count(c) from Complaint c group by c.category.name order by count(c) desc")
    List<Object[]> countByCategoryName();

    @Query("select c.resolvedAt, c.createdAt from Complaint c where c.resolvedAt is not null")
    List<Object[]> findResolutionTimes();

    /** Pessimistic read used by the workflow operations to serialise concurrent updates. */
    @Query("select c from Complaint c where c.id = :id")
    @Lock(LockModeType.PESSIMISTIC_WRITE)
    Optional<Complaint> findByIdForUpdate(@Param("id") Long id);
}