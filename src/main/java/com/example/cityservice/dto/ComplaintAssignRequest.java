package com.example.cityservice.dto;

import jakarta.validation.constraints.NotNull;

/** Staff request to hand a complaint to a specific employee. */
public record ComplaintAssignRequest(
        @NotNull(message = "Təyinat alıcısı seçilməlidir")
        Long assigneeId) {
}