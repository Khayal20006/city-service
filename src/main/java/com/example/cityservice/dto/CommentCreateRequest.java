package com.example.cityservice.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

/** Message posted on a complaint. Staff may mark a note as internal. */
public record CommentCreateRequest(
        @NotBlank(message = "Mesaj tələb olunur")
        @Size(max = 2000, message = "Mesaj 2000 simvoldan uzun ola bilməz")
        String message,

        Boolean internal) {
}