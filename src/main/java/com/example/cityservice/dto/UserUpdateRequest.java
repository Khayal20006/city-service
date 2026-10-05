package com.example.cityservice.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

import com.example.cityservice.model.User;

/** Self-service profile update. {@code role} and {@code active} are admin-only fields. */
public record UserUpdateRequest(
        @Email(message = "Email formatı düzgün deyil")
        @Size(max = 150, message = "Email 150 simvoldan uzun ola bilməz")
        String email,

        @Size(max = 120, message = "Ad 120 simvoldan uzun ola bilməz")
        String fullName,

        @Size(max = 20, message = "Telefon 20 simvoldan uzun ola bilməz")
        String phoneNumber,

        User.Role role,

        Boolean active) {
}