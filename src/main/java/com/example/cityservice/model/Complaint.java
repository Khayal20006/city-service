package com.example.cityservice.model;

import java.time.Instant;
import java.util.EnumSet;
import java.util.Set;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.PrePersist;
import jakarta.persistence.PreUpdate;
import jakarta.persistence.Table;
import jakarta.persistence.Version;
import lombok.AccessLevel;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.ToString;

/** A citizen complaint: the central record of the portal. */
@Entity
@Table(name = "complaints")
@Getter
@Setter
@Builder
@AllArgsConstructor
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@ToString(of = {"id", "referenceCode", "title", "status"})
public class Complaint {

    public enum Priority {
        LOW,
        NORMAL,
        HIGH,
        URGENT
    }

    public enum Status {
        PENDING,
        UNDER_REVIEW,
        IN_PROGRESS,
        RESOLVED,
        REJECTED,
        CANCELLED;

        public boolean isClosed() {
            return this == RESOLVED || this == REJECTED || this == CANCELLED;
        }

        public boolean isOpen() {
            return !isClosed();
        }
    }

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /** Human-readable ticket number in the {@code CS-<year>-<number>} form. */
    @Column(name = "reference_code", nullable = false, length = 30, unique = true)
    private String referenceCode;

    @Column(name = "title", nullable = false, length = 120)
    private String title;

    @Column(name = "description", nullable = false, length = 4000)
    private String description;

    @Column(name = "image_url", length = 500)
    private String imageUrl;

    @Column(name = "latitude", nullable = false)
    private double latitude;

    @Column(name = "longitude", nullable = false)
    private double longitude;

    @Column(name = "district", length = 80)
    private String district;

    @Column(name = "address", length = 300)
    private String address;

    @Enumerated(EnumType.STRING)
    @Column(name = "priority", nullable = false, length = 20)
    @Builder.Default
    private Priority priority = Priority.NORMAL;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false, length = 30)
    @Builder.Default
    private Status status = Status.PENDING;

    @Column(name = "resolution_note", length = 1000)
    private String resolutionNote;

    @Column(name = "resolved_at")
    private Instant resolvedAt;

    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    @Column(name = "updated_at")
    private Instant updatedAt;

    @Version
    @Column(name = "version", nullable = false)
    private Long version;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "category_id", nullable = false)
    private Category category;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "assigned_to_id")
    private User assignedTo;

    @PrePersist
    void onCreate() {
        Instant now = Instant.now();
        this.createdAt = now;
        this.updatedAt = now;
        if (this.status == null) {
            this.status = Status.PENDING;
        }
        if (this.priority == null) {
            this.priority = Priority.NORMAL;
        }
    }

    @PreUpdate
    void onUpdate() {
        this.updatedAt = Instant.now();
    }

    public boolean isClosed() {
        return status != null && status.isClosed();
    }

    /**
     * Statuses this complaint may move to. {@code REJECTED}, {@code RESOLVED} and
     * {@code CANCELLED} are terminal; a closed complaint can only be reopened.
     */
    public Set<Status> allowedTransitions() {
        if (status == null) {
            return EnumSet.allOf(Status.class);
        }
        return switch (status) {
            case PENDING -> EnumSet.of(Status.UNDER_REVIEW, Status.RESOLVED, Status.REJECTED, Status.CANCELLED);
            case UNDER_REVIEW -> EnumSet.of(Status.IN_PROGRESS, Status.RESOLVED, Status.REJECTED);
            case IN_PROGRESS -> EnumSet.of(Status.RESOLVED, Status.UNDER_REVIEW);
            case RESOLVED, REJECTED, CANCELLED -> EnumSet.of(Status.PENDING, Status.UNDER_REVIEW);
        };
    }
}