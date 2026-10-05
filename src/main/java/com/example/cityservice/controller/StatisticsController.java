package com.example.cityservice.controller;

import com.example.cityservice.dto.StatisticsResponse;
import com.example.cityservice.service.StatisticsService;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/** Dashboard numbers. Staff only. */
@RestController
@RequestMapping("/api/stats")
@PreAuthorize("hasAnyRole('DEPARTMENT_MANAGER', 'FIELD_EMPLOYEE', 'ADMIN')")
public class StatisticsController {

    private final StatisticsService statisticsService;

    public StatisticsController(StatisticsService statisticsService) {
        this.statisticsService = statisticsService;
    }

    @GetMapping("/summary")
    public StatisticsResponse summary() {
        return statisticsService.summary();
    }
}