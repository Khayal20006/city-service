package com.example.cityservice.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

/** Registration request. Every account starts as a citizen. */
public record RegisterRequest(
        @NotBlank(message = "İstifadəçi adı tələb olunur")
        @Pattern(regexp = "^[a-zA-Z0-9._-]{3,50}$",
                message = "İstifadəçi adı 3-50 simvol olmalı, hərf/rəqəm/._- istifadə edə bilər")
        String username,

        @NotBlank(message = "Email tələb olunur")
        @Email(message = "Email formatı düzgün deyil")
        @Size(max = 150, message = "Email 150 simvoldan uzun ola bilməz")
        String email,

        @NotBlank(message = "Parol tələb olunur")
        @Size(min = 8, max = 72, message = "Parol 8-72 simvol arasında olmalıdır")
        String password,

        @Size(max = 120, message = "Ad 120 simvoldan uzun ola bilməz")
        String fullName,

        @Size(max = 20, message = "Telefon 20 simvoldan uzun ola bilməz")
        String phoneNumber) {
}