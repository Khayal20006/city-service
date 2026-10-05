package com.example.cityservice.dto;

import jakarta.validation.constraints.DecimalMax;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import com.example.cityservice.model.Complaint;

/** Payload used by citizens (and staff on their behalf) to file a complaint. */
public record ComplaintCreateRequest(
        @NotBlank(message = "Başlıq tələb olunur")
        @Size(max = 120, message = "Başlıq 120 simvoldan uzun ola bilməz")
        String title,

        @NotBlank(message = "Təsvir tələb olunur")
        @Size(min = 10, max = 4000, message = "Təsvir 10-4000 simvol arasında olmalıdır")
        String description,

        @NotBlank(message = "Kateqoriya seçilməlidir")
        String categoryName,

        @NotNull(message = "Coğrafi en dəqiqliyət tələb olunur")
        @DecimalMin(value = "-90.0", message = "Enlem -90 ilə 90 arasında olmalıdır")
        @DecimalMax(value = "90.0", message = "Enlem -90 ilə 90 arasında olmalıdır")
        Double latitude,

        @NotNull(message = "Coğrafi uzunluq tələb olunur")
        @DecimalMin(value = "-180.0", message = "Uzunluq -180 ilə 180 arasında olmalıdır")
        @DecimalMax(value = "180.0", message = "Uzunluq -180 ilə 180 arasında olmalıdır")
        Double longitude,

        @Size(max = 80, message = "Rayon adı 80 simvoldan uzun ola bilməz")
        String district,

        @Size(max = 300, message = "Ünvan 300 simvoldan uzun ola bilməz")
        String address,

        @Size(max = 500, message = "Şəkil linki 500 simvoldan uzun ola bilməz")
        String imageUrl,

        Complaint.Priority priority) {
}