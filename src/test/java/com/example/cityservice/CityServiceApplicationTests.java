package com.example.cityservice;

import static org.assertj.core.api.Assertions.assertThat;

import com.example.cityservice.model.Category;
import com.example.cityservice.model.Complaint;
import com.example.cityservice.model.Complaint.Status;
import com.example.cityservice.model.User;
import com.example.cityservice.repository.CategoryRepository;
import com.example.cityservice.repository.ComplaintRepository;
import com.example.cityservice.repository.UserRepository;
import com.example.cityservice.security.JwtService;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;

class CityServiceApplicationTests extends IntegrationTest {

    @Autowired
    private CategoryRepository categoryRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private ComplaintRepository complaintRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private JwtService jwtService;

    @org.springframework.beans.factory.annotation.Value("${city.bootstrap.admin.password}")
    private String bootstrapAdminPassword;

    @Test
    @DisplayName("context loads, Flyway migrated the schema and the bootstrap data exists")
    void contextLoadsAndSeedDataExists() {
        assertThat(categoryRepository.count()).isGreaterThanOrEqualTo(5);
        assertThat(userRepository.existsByRole(User.Role.ADMIN)).isTrue();
        assertThat(jwtService.expiresInSeconds()).isPositive();
    }

    @Test
    @DisplayName("defaults are applied on persist (timestamps, status, priority, active)")
    void defaultsAreAppliedOnPersist() {
        User owner = userRepository.findByUsernameIgnoreCase("admin")
                .orElseThrow(() -> new IllegalStateException("bootstrap admin yoxdur"));

        Category category = categoryRepository.findAll().getFirst();
        String referenceCode = "CS-TEST-" + complaintRepository.nextReferenceNumber();

        Complaint complaint = complaintRepository.save(Complaint.builder()
                .referenceCode(referenceCode)
                .title("Test şikayəti")
                .description("Test təsviri")
                .latitude(40.4093)
                .longitude(49.8671)
                .user(owner)
                .category(category)
                .build());

        try {
            Complaint reloaded = complaintRepository.findById(complaint.getId()).orElseThrow();
            assertThat(reloaded.getStatus()).isEqualTo(Status.PENDING);
            assertThat(reloaded.getPriority()).isEqualTo(Complaint.Priority.NORMAL);
            assertThat(reloaded.isClosed()).isFalse();
            assertThat(reloaded.getCreatedAt()).isNotNull();
            assertThat(reloaded.getUpdatedAt()).isNotNull();
            assertThat(owner.isActive()).isTrue();
            assertThat(owner.getCreatedAt()).isNotNull();

            assertThat(complaintRepository.findByReferenceCode(referenceCode)).isPresent();
            assertThat(passwordEncoder.matches(bootstrapAdminPassword, owner.getPassword())).isTrue();
        } finally {
            complaintRepository.deleteById(complaint.getId());
        }
    }
}