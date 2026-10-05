package com.example.cityservice.dto;

import com.example.cityservice.model.Complaint.Status;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

/** Staff request to move a complaint to another status. */
public record ComplaintStatusUpdateRequest(
        @NotBlank(message = "Yeni status tələb olunur")
        Status status,

        @Size(max = 1000, message = "Qeyd 1000 simvoldan uzun ola bilməz")
        String note) {
}