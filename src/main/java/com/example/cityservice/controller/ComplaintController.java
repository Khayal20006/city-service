package com.example.cityservice.controller;

import java.time.Instant;
import java.util.List;

import com.example.cityservice.dto.ComplaintAssignRequest;
import com.example.cityservice.dto.ComplaintCreateRequest;
import com.example.cityservice.dto.ComplaintMarkerResponse;
import com.example.cityservice.dto.ComplaintResponse;
import com.example.cityservice.dto.ComplaintStatusUpdateRequest;
import com.example.cityservice.dto.CommentCreateRequest;
import com.example.cityservice.dto.PageResponse;
import com.example.cityservice.dto.SearchCriteria;
import com.example.cityservice.exception.ConflictException;
import com.example.cityservice.model.Complaint.Priority;
import com.example.cityservice.model.Complaint.Status;
import com.example.cityservice.model.User;
import com.example.cityservice.security.CityUserDetailsService;
import com.example.cityservice.service.ComplaintService;
import com.example.cityservice.service.CurrentUserService;
import jakarta.validation.Valid;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/complaints")
public class ComplaintController {

    private static final int MAX_PAGE_SIZE = 100;

    private final ComplaintService complaintService;
    private final CurrentUserService currentUserService;
    private final CityUserDetailsService userDetailsService;

    public ComplaintController(ComplaintService complaintService,
                               CurrentUserService currentUserService,
                               CityUserDetailsService userDetailsService) {
        this.complaintService = complaintService;
        this.currentUserService = currentUserService;
        this.userDetailsService = userDetailsService;
    }

    @PostMapping
    public ResponseEntity<ComplaintResponse> create(@Valid @RequestBody ComplaintCreateRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(complaintService.create(request));
    }

    /** Admin endpoint: files a complaint on behalf of a citizen. */
    @PostMapping("/on-behalf/{ownerId}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ComplaintResponse> createOnBehalfOf(
            @PathVariable Long ownerId,
            @Valid @RequestBody ComplaintCreateRequest request) {
        User owner = userDetailsService.loadEntityById(ownerId);
        return ResponseEntity.status(HttpStatus.CREATED).body(complaintService.createOnBehalfOf(request, owner));
    }

    // -------------------------------------------------------------------- read

    @GetMapping("/{id}")
    public ComplaintResponse findById(@PathVariable Long id,
                                     @RequestParam(defaultValue = "true") boolean comments) {
        return complaintService.findById(id, comments);
    }

    @GetMapping("/reference/{referenceCode}")
    public ComplaintResponse findByReferenceCode(@PathVariable String referenceCode) {
        return complaintService.findByReferenceCode(referenceCode);
    }

    @GetMapping
    public PageResponse<ComplaintResponse> search(
            @RequestParam(required = false) Status status,
            @RequestParam(required = false) Priority priority,
            @RequestParam(required = false) Long categoryId,
            @RequestParam(required = false) Long userId,
            @RequestParam(required = false) Long assignedToId,
            @RequestParam(required = false) String district,
            @RequestParam(required = false) String referenceCode,
            @RequestParam(required = false) String text,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) Instant createdFrom,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) Instant createdTo,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {

        SearchCriteria criteria = SearchCriteria.of(status, priority, categoryId, userId, assignedToId,
                null, district, referenceCode, text, createdFrom, createdTo);
        if (!criteria.isDateRangeValid()) {
            throw new ConflictException("createdFrom createdTo-dan sonra ola bilməz");
        }
        return complaintService.search(criteria, pageable(page, size, "createdAt"));
    }

    /** Complaints filed by the authenticated citizen. */
    @GetMapping("/mine")
    public PageResponse<ComplaintResponse> mine(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        return complaintService.findMine(pageable(page, size, "createdAt"));
    }

    /** Complaints currently assigned to the authenticated staff member. */
    @GetMapping("/assigned-to-me")
    public PageResponse<ComplaintResponse> assignedToMe(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        return complaintService.findAssignedToMe(pageable(page, size, "createdAt"));
    }

    /** Map view. Staff only, and returns a capped number of markers. */
    @GetMapping("/map")
    @PreAuthorize("hasAnyRole('DEPARTMENT_MANAGER', 'FIELD_EMPLOYEE', 'ADMIN')")
    public List<ComplaintMarkerResponse> map(
            @RequestParam(required = false) Status status,
            @RequestParam(required = false) Long categoryId,
            @RequestParam(required = false) String district,
            @RequestParam(defaultValue = "500") int limit) {
        return complaintService.markers(
                SearchCriteria.of(status, null, categoryId, null, null, null, district, null, null, null, null),
                limit);
    }

    // ------------------------------------------------------------------ update

    @PutMapping("/{id}")
    public ComplaintResponse update(@PathVariable Long id, @Valid @RequestBody ComplaintCreateRequest request) {
        return complaintService.update(id, request);
    }

    @PatchMapping("/{id}/status")
    @PreAuthorize("hasAnyRole('DEPARTMENT_MANAGER', 'FIELD_EMPLOYEE', 'ADMIN')")
    public ComplaintResponse changeStatus(@PathVariable Long id,
                                          @Valid @RequestBody ComplaintStatusUpdateRequest request) {
        return complaintService.changeStatus(id, request);
    }

    @PatchMapping("/{id}/assign")
    @PreAuthorize("hasAnyRole('DEPARTMENT_MANAGER', 'FIELD_EMPLOYEE', 'ADMIN')")
    public ComplaintResponse assign(@PathVariable Long id,
                                    @Valid @RequestBody ComplaintAssignRequest request) {
        return complaintService.assign(id, request);
    }

    @PostMapping("/{id}/comments")
    public ResponseEntity<ComplaintResponse> addComment(@PathVariable Long id,
                                                        @Valid @RequestBody CommentCreateRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(complaintService.addComment(id, request));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        currentUserService.requireAdmin();
        complaintService.delete(id);
        return ResponseEntity.noContent().build();
    }

    private static Pageable pageable(int page, int size, String sortProperty) {
        return PageRequest.of(Math.max(page, 0), Math.min(Math.max(size, 1), MAX_PAGE_SIZE),
                Sort.by(Sort.Direction.DESC, sortProperty));
    }
}