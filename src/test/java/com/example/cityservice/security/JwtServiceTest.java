package com.example.cityservice.security;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

import com.example.cityservice.model.User;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

class JwtServiceTest {

    private static final String SECRET = "unit-test-secret-key-that-is-long-enough-for-hs256!!";
    private static final String ISSUER = "https://api.city.gov.az";

    private JwtService jwtService;
    private User user;

    @BeforeEach
    void setUp() {
        jwtService = new JwtService(new JwtProperties(SECRET, ISSUER, 30));
        user = User.builder()
                .id(7L)
                .username("aysel")
                .email("aysel@example.az")
                .fullName("Aysel Məmmədova")
                .password("$2a$10$abcdefghijklmnopqrstuv")
                .role(User.Role.DEPARTMENT_MANAGER)
                .active(true)
                .build();
    }

    @Test
    @DisplayName("issued token round-trips the claims we rely on")
    void issuesAndDecodesToken() {
        String token = jwtService.issue(user);
        var jwt = jwtService.decode(token);

        assertThat(jwt.getSubject()).isEqualTo("aysel");
        assertThat(jwt.getIssuer().toString()).isEqualTo(ISSUER);
        assertThat(jwt.getClaimAsString(JwtService.CLAIM_USER_ID)).isEqualTo("7");
        assertThat(jwt.getClaimAsString(JwtService.CLAIM_FULL_NAME)).isEqualTo("Aysel Məmmədova");
        assertThat(jwt.getClaimAsStringList(JwtService.CLAIM_ROLES))
                .containsExactly("ROLE_DEPARTMENT_MANAGER");
        assertThat(jwt.getExpiresAt()).isAfter(jwt.getIssuedAt());
    }

    @Test
    @DisplayName("a token signed with a different key is rejected")
    void rejectsForeignSignature() {
        JwtService foreign = new JwtService(new JwtProperties(
                "a-completely-different-secret-key-long-enough-here!!", ISSUER, 30));
        String foreignToken = foreign.issue(user);

        assertThatThrownBy(() -> jwtService.decode(foreignToken)).isNotNull();
    }

    @Test
    @DisplayName("a token from another issuer is rejected")
    void rejectsForeignIssuer() {
        JwtService foreign = new JwtService(new JwtProperties(
                SECRET, "https://evil.example.com", 30));
        String foreignToken = foreign.issue(user);

        assertThatThrownBy(() -> jwtService.decode(foreignToken)).isNotNull();
    }

    @Test
    void expiresInSecondsMatchesConfiguration() {
        assertThat(jwtService.expiresInSeconds()).isEqualTo(30 * 60);
    }

    @Test
    @DisplayName("a short secret fails fast at construction time")
    void rejectsWeakSecret() {
        assertThatThrownBy(() -> new JwtProperties("too-short", ISSUER, 30))
                .isInstanceOf(IllegalArgumentException.class);
    }
}