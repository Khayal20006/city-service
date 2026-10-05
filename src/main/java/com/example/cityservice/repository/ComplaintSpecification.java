package com.example.cityservice.repository;

import java.util.Locale;

import com.example.cityservice.dto.SearchCriteria;
import com.example.cityservice.model.Complaint;
import jakarta.persistence.criteria.Predicate;
import org.springframework.data.jpa.domain.Specification;

/**
 * Composable filters for the complaint search. Every fragment ignores blank input so the
 * controller can pass optional request parameters straight through.
 */
public final class ComplaintSpecification {

    private ComplaintSpecification() {
    }

    public static Specification<Complaint> allOf(SearchCriteria criteria) {
        return (root, query, cb) -> {
            if (criteria == null) {
                return cb.conjunction();
            }
            Predicate predicate = cb.conjunction();
            predicate = and(predicate, hasStatus(criteria), cb, root);
            predicate = and(predicate, hasPriority(criteria), cb, root);
            predicate = and(predicate, hasCategory(criteria), cb, root);
            predicate = and(predicate, hasUser(criteria), cb, root);
            predicate = and(predicate, hasAssignee(criteria), cb, root);
            predicate = and(predicate, hasDistrict(criteria), cb, root);
            predicate = and(predicate, hasReferenceCode(criteria), cb, root);
            predicate = and(predicate, hasText(criteria), cb, root);
            predicate = and(predicate, createdBetween(criteria), cb, root);
            return predicate;
        };
    }

    public static Specification<Complaint> hasStatus(SearchCriteria criteria) {
        return (root, query, cb) -> criteria == null || criteria.status() == null
                ? cb.conjunction()
                : cb.equal(root.get("status"), criteria.status());
    }

    public static Specification<Complaint> hasPriority(SearchCriteria criteria) {
        return (root, query, cb) -> criteria == null || criteria.priority() == null
                ? cb.conjunction()
                : cb.equal(root.get("priority"), criteria.priority());
    }

    public static Specification<Complaint> hasCategory(SearchCriteria criteria) {
        return (root, query, cb) -> criteria == null || criteria.categoryId() == null
                ? cb.conjunction()
                : cb.equal(root.get("category").get("id"), criteria.categoryId());
    }

    public static Specification<Complaint> hasUser(SearchCriteria criteria) {
        return (root, query, cb) -> criteria == null || criteria.userId() == null
                ? cb.conjunction()
                : cb.equal(root.get("user").get("id"), criteria.userId());
    }

    public static Specification<Complaint> hasAssignee(SearchCriteria criteria) {
        return (root, query, cb) -> criteria == null || criteria.assignedToId() == null
                ? cb.conjunction()
                : cb.equal(root.get("assignedTo").get("id"), criteria.assignedToId());
    }

    public static Specification<Complaint> hasDistrict(SearchCriteria criteria) {
        return (root, query, cb) -> isBlank(criteria == null ? null : criteria.district())
                ? cb.conjunction()
                : cb.equal(cb.lower(root.get("district")),
                criteria.district().trim().toLowerCase(Locale.ROOT));
    }

    public static Specification<Complaint> hasReferenceCode(SearchCriteria criteria) {
        return (root, query, cb) -> isBlank(criteria == null ? null : criteria.referenceCode())
                ? cb.conjunction()
                : cb.equal(cb.lower(root.get("referenceCode")),
                criteria.referenceCode().trim().toLowerCase(Locale.ROOT));
    }

    /** Free-text search over title and description. */
    public static Specification<Complaint> hasText(SearchCriteria criteria) {
        return (root, query, cb) -> isBlank(criteria == null ? null : criteria.text())
                ? cb.conjunction()
                : cb.or(
                cb.like(cb.lower(root.get("title")), likePattern(criteria.text())),
                cb.like(cb.lower(root.get("description")), likePattern(criteria.text())));
    }

    public static Specification<Complaint> createdBetween(SearchCriteria criteria) {
        return (root, query, cb) -> {
            if (criteria == null) {
                return cb.conjunction();
            }
            Predicate predicate = cb.conjunction();
            if (criteria.createdFrom() != null) {
                predicate = cb.and(predicate, cb.greaterThanOrEqualTo(root.get("createdAt"), criteria.createdFrom()));
            }
            if (criteria.createdTo() != null) {
                predicate = cb.and(predicate, cb.lessThanOrEqualTo(root.get("createdAt"), criteria.createdTo()));
            }
            return predicate;
        };
    }

    public static Specification<Complaint> createdAfter(java.time.Instant from) {
        return (root, query, cb) -> from == null
                ? cb.conjunction()
                : cb.greaterThanOrEqualTo(root.get("createdAt"), from);
    }

    private static String likePattern(String text) {
        return "%" + text.trim().toLowerCase(Locale.ROOT) + "%";
    }

    private static boolean isBlank(String value) {
        return value == null || value.isBlank();
    }

    private static Predicate and(Predicate base, Specification<Complaint> fragment,
                                 jakarta.persistence.criteria.CriteriaBuilder cb,
                                 jakarta.persistence.criteria.Root<Complaint> root) {
        return cb.and(base, fragment.toPredicate(root, null, cb));
    }
}