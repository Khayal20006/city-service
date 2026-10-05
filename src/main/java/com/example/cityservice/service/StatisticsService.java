package com.example.cityservice.service;

import java.time.Duration;
import java.time.Instant;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

import com.example.cityservice.dto.StatisticsResponse;
import com.example.cityservice.model.Complaint.Priority;
import com.example.cityservice.model.Complaint.Status;
import com.example.cityservice.repository.ComplaintRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/** Dashboard aggregates. Staff only. */
@Service
public class StatisticsService {

    private static final List<Status> OPEN_STATUSES =
            List.of(Status.PENDING, Status.UNDER_REVIEW, Status.IN_PROGRESS);

    private final ComplaintRepository complaintRepository;
    private final CurrentUserService currentUserService;

    public StatisticsService(ComplaintRepository complaintRepository, CurrentUserService currentUserService) {
        this.complaintRepository = complaintRepository;
        this.currentUserService = currentUserService;
    }

    @Transactional(readOnly = true)
    public StatisticsResponse summary() {
        currentUserService.requireStaff();

        long total = complaintRepository.count();
        long open = complaintRepository.countByStatusIn(OPEN_STATUSES);
        long closed = total - open;

        Map<String, Long> byStatus = new LinkedHashMap<>();
        for (Status status : Status.values()) {
            byStatus.put(status.name(), complaintRepository.countByStatus(status));
        }

        Map<String, Long> byPriority = new LinkedHashMap<>();
        for (Priority priority : Priority.values()) {
            byPriority.put(priority.name(), complaintRepository.countByPriority(priority));
        }

        Map<String, Long> byCategory = new LinkedHashMap<>();
        for (Object[] row : complaintRepository.countByCategoryName()) {
            byCategory.put(String.valueOf(row[0]), toLong(row[1]));
        }

        Map<String, Long> byDistrict = new LinkedHashMap<>();
        for (Object[] row : complaintRepository.countByDistrict()) {
            byDistrict.put(String.valueOf(row[0]), toLong(row[1]));
        }

        return new StatisticsResponse(total, open, closed, byStatus, byPriority, byCategory, byDistrict,
                averageResolutionHours(), Instant.now());
    }

    /** Mean hours between filing and resolution; {@code 0} when nothing is resolved yet. */
    private double averageResolutionHours() {
        List<Object[]> rows = complaintRepository.findResolutionTimes();
        if (rows.isEmpty()) {
            return 0d;
        }
        double sumHours = 0d;
        int counted = 0;
        for (Object[] row : rows) {
            if (row[0] instanceof Instant resolvedAt && row[1] instanceof Instant createdAt
                    && resolvedAt.isAfter(createdAt)) {
                sumHours += Duration.between(createdAt, resolvedAt).toMinutes() / 60d;
                counted++;
            }
        }
        return counted == 0 ? 0d : Math.round(sumHours / counted * 100d) / 100d;
    }

    private static long toLong(Object value) {
        return value instanceof Number number ? number.longValue() : 0L;
    }
}