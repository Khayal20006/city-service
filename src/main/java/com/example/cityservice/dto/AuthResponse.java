package com.example.cityservice.dto;

import java.time.Instant;
import java.util.List;

import com.example.cityservice.model.User;

/**
 * Payload returned by {@code POST /api/auth/login} and {@code POST /api/auth/register}.
 */
public record AuthResponse(
        String accessToken,
        String tokenType,
        long expiresInSeconds,
        UserResponse user) {

    public static AuthResponse of(String token, long expiresInSeconds, User user) {
        return new AuthResponse(token, "Bearer", expiresInSeconds, UserResponse.of(user));
    }

    /** Safe projection of {@link User}: the password hash is never exposed. */
    public record UserResponse(
            Long id,
            String username,
            String email,
            String fullName,
            String phoneNumber,
            User.Role role,
            boolean active,
            Instant createdAt) {

        public static UserResponse of(User user) {
            return new UserResponse(
                    user.getId(),
                    user.getUsername(),
                    user.getEmail(),
                    user.getFullName(),
                    user.getPhoneNumber(),
                    user.getRole(),
                    user.isActive(),
                    user.getCreatedAt());
        }
    }
}