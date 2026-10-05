package com.example.cityservice.model;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

import java.util.ArrayList;
import java.util.EnumSet;
import java.util.List;

import com.example.cityservice.exception.InvalidStateTransitionException;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.EnumSource;

class ComplaintStatusTest {

    private static Complaint complaintIn(Complaint.Status status) {
        Complaint complaint = new Complaint();
        complaint.setStatus(status);
        return complaint;
    }

    @Nested
    @DisplayName("allowedTransitions")
    class AllowedTransitions {

        @Test
        void pendingCanBeReviewedResolvedRejectedOrCancelled() {
            assertThat(complaintIn(Complaint.Status.PENDING).allowedTransitions())
                    .isEqualTo(EnumSet.of(Complaint.Status.UNDER_REVIEW, Complaint.Status.RESOLVED,
                            Complaint.Status.REJECTED, Complaint.Status.CANCELLED));
        }

        @Test
        void terminalStatesCanOnlyBeReopened() {
            for (Complaint.Status terminal : List.of(Complaint.Status.RESOLVED,
                    Complaint.Status.REJECTED, Complaint.Status.CANCELLED)) {
                assertThat(complaintIn(terminal).allowedTransitions())
                        .isEqualTo(EnumSet.of(Complaint.Status.PENDING, Complaint.Status.UNDER_REVIEW));
            }
        }

        @Test
        void transitionsNeverIncludeTheCurrentStatus() {
            for (Complaint.Status status : Complaint.Status.values()) {
                assertThat(complaintIn(status).allowedTransitions()).doesNotContain(status);
            }
        }
    }

    @Nested
    @DisplayName("isClosed")
    class IsClosed {

        @ParameterizedTest
        @EnumSource(value = Complaint.Status.class, names = {"PENDING", "UNDER_REVIEW", "IN_PROGRESS"})
        void openStatusesAreNotClosed(Complaint.Status status) {
            assertThat(complaintIn(status).isClosed()).isFalse();
        }

        @ParameterizedTest
        @EnumSource(value = Complaint.Status.class, names = {"RESOLVED", "REJECTED", "CANCELLED"})
        void closedStatusesAreClosed(Complaint.Status status) {
            assertThat(complaintIn(status).isClosed()).isTrue();
        }

        @Test
        void isOpenIsTheInverseOfIsClosed() {
            for (Complaint.Status status : Complaint.Status.values()) {
                Complaint complaint = complaintIn(status);
                assertThat(complaint.getStatus().isOpen()).isNotEqualTo(complaint.isClosed());
            }
        }
    }

    @Nested
    @DisplayName("exception contract")
    class ExceptionContract {

        @Test
        void allowedListIsUnmodifiable() {
            InvalidStateTransitionException ex =
                    new InvalidStateTransitionException("boom", List.of("PENDING"));
            assertThatThrownBy(() -> ex.getAllowed().add("HACKED"))
                    .isInstanceOf(UnsupportedOperationException.class);
            assertThat(ex.getAllowed()).containsExactly("PENDING");
        }

        @Test
        void allowedListIsIsolatedFromTheCallersList() {
            List<String> caller = new ArrayList<>(List.of("PENDING"));
            InvalidStateTransitionException ex = new InvalidStateTransitionException("boom", caller);
            caller.add("IN_PROGRESS");
            assertThat(ex.getAllowed()).containsExactly("PENDING");
        }

        @Test
        void nullAllowedListBecomesEmpty() {
            InvalidStateTransitionException ex = new InvalidStateTransitionException("boom", null);
            assertThat(ex.getAllowed()).isEmpty();
        }
    }
}