package com.example.cityservice.dto;

import static org.assertj.core.api.Assertions.assertThat;

import java.time.Instant;

import com.example.cityservice.model.Complaint.Priority;
import com.example.cityservice.model.Complaint.Status;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

class SearchCriteriaTest {

    @Test
    void emptyCriteriaMatchesEverything() {
        SearchCriteria criteria = SearchCriteria.empty();

        assertThat(criteria.hasStatus()).isFalse();
        assertThat(criteria.hasText()).isFalse();
        assertThat(criteria.isDateRangeValid()).isTrue();
    }

    @Test
    void blankTextIsNotTreatedAsAFilter() {
        SearchCriteria criteria = SearchCriteria.of(null, null, null, null, null, null,
                null, null, "   ", null, null);

        assertThat(criteria.hasText()).isFalse();
    }

    @Test
    void presentTextIsDetected() {
        SearchCriteria criteria = SearchCriteria.of(null, null, null, null, null, null,
                null, null, "bin küçə", null, null);

        assertThat(criteria.hasText()).isTrue();
    }

    @Test
    void statusFilterIsDetected() {
        SearchCriteria criteria = SearchCriteria.of(Status.RESOLVED, null, null, null, null,
                null, null, null, null, null, null);

        assertThat(criteria.hasStatus()).isTrue();
        assertThat(criteria.status()).isEqualTo(Status.RESOLVED);
        assertThat(criteria.priority()).isNull();
    }

    @Test
    void invertedDateRangeIsRejected() {
        Instant from = Instant.parse("2026-05-02T10:00:00Z");
        Instant to = Instant.parse("2026-05-01T10:00:00Z");
        SearchCriteria criteria = SearchCriteria.of(null, Priority.HIGH, null, null, null, null,
                null, null, null, from, to);

        assertThat(criteria.isDateRangeValid()).isFalse();
    }

    @Test
    void equalDateRangeIsAccepted() {
        Instant moment = Instant.parse("2026-05-02T10:00:00Z");
        SearchCriteria criteria = SearchCriteria.of(null, null, null, null, null, null,
                null, null, null, moment, moment);

        assertThat(criteria.isDateRangeValid()).isTrue();
    }
}