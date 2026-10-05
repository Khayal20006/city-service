package com.example.cityservice.dto;

import jakarta.validation.constraints.NotBlank;

/** Login request. */
public record LoginRequest(
        @NotBlank(message = "İstifadəçi adı tələb olunur")
        String username,

        @NotBlank(message = "Parol tələb olunur")
        String password) {
}