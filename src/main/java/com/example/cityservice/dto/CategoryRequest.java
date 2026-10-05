package com.example.cityservice.dto;

import com.example.cityservice.model.Category;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

/** Create/update payload for a category. Admin only. */
public record CategoryRequest(
        @NotBlank(message = "Kateqoriya adı tələb olunur")
        @Size(max = 100, message = "Ad 100 simvoldan uzun ola bilməz")
        String name,

        @Size(max = 500, message = "Təsvir 500 simvoldan uzun ola bilməz")
        String description,

        @NotBlank(message = "İdarə adı tələb olunur")
        @Size(max = 150, message = "İdarə adı 150 simvoldan uzun ola bilməz")
        String departmentName,

        @Email(message = "Email formatı düzgün deyil")
        @Size(max = 150, message = "Email 150 simvoldan uzun ola bilməz")
        String contactEmail,

        @Min(value = 1, message = "Təxmini müddət 1 saatdan az ola bilməz")
        Integer estimatedResolutionHours,

        Boolean active) {

    public Category applyTo(Category category) {
        category.setName(name.trim());
        category.setDescription(blankToNull(description));
        category.setDepartmentName(departmentName.trim());
        category.setContactEmail(blankToNull(contactEmail));
        if (estimatedResolutionHours != null) {
            category.setEstimatedResolutionHours(estimatedResolutionHours);
        }
        if (active != null) {
            category.setActive(active);
        }
        return category;
    }

    private static String blankToNull(String value) {
        if (value == null) {
            return null;
        }
        String trimmed = value.trim();
        return trimmed.isEmpty() ? null : trimmed;
    }
}