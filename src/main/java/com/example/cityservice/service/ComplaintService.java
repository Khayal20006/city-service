package com.example.cityservice.service;

import java.time.Instant;
import java.time.Year;
import java.util.ArrayList;
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
import com.example.cityservice.exception.InvalidStateTransitionException;
import com.example.cityservice.exception.ResourceNotFoundException;
import com.example.cityservice.mapper.ComplaintMapper;
import com.example.cityservice.model.Category;
import com.example.cityservice.model.Complaint;
import com.example.cityservice.model.Complaint.Priority;
import com.example.cityservice.model.Complaint.Status;
import com.example.cityservice.model.ComplaintComment;
import com.example.cityservice.model.User;
import com.example.cityservice.repository.CategoryRepository;
import com.example.cityservice.repository.ComplaintCommentRepository;
import com.example.cityservice.repository.ComplaintRepository;
import com.example.cityservice.repository.ComplaintSpecification;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/** Business rules of the complaint workflow: creation, visibility, assignment, status. */
@Service
public class ComplaintService {

    private static final Logger log = LoggerFactory.getLogger(ComplaintService.class);
    private static final int MAX_MARKERS = 2000;

    private final ComplaintRepository complaintRepository;
    private final ComplaintCommentRepository commentRepository;
    private final CategoryRepository categoryRepository;
    private final CurrentUserService currentUserService;
    private final ComplaintMapper mapper;

    public ComplaintService(ComplaintRepository complaintRepository,
                            ComplaintCommentRepository commentRepository,
                            CategoryRepository categoryRepository,
                            CurrentUserService currentUserService,
                            ComplaintMapper mapper) {
        this.complaintRepository = complaintRepository;
        this.commentRepository = commentRepository;
        this.categoryRepository = categoryRepository;
        this.currentUserService = currentUserService;
        this.mapper = mapper;
    }

    // ------------------------------------------------------------------ create

    @Transactional
    public ComplaintResponse create(ComplaintCreateRequest request) {
        return create(request, currentUserService.require());
    }

    /** Admin endpoint: files a complaint for a citizen (phone or counter intake). */
    @Transactional
    public ComplaintResponse createOnBehalfOf(ComplaintCreateRequest request, User owner) {
        currentUserService.requireAdmin();
        return create(request, owner);
    }

    private ComplaintResponse create(ComplaintCreateRequest request, User owner) {
        Category category = requireCategoryByName(request.categoryName());

        Complaint complaint = Complaint.builder()
                .referenceCode(nextReferenceCode())
                .title(request.title().trim())
                .description(request.description().trim())
                .imageUrl(blankToNull(request.imageUrl()))
                .latitude(request.latitude())
                .longitude(request.longitude())
                .district(blankToNull(request.district()))
                .address(blankToNull(request.address()))
                .priority(request.priority() == null ? Priority.NORMAL : request.priority())
                .status(Status.PENDING)
                .user(owner)
                .category(category)
                .build();

        complaint = complaintRepository.save(complaint);

        log.info("Şikayət yaradıldı: {} -> {}", complaint.getReferenceCode(), category.getDepartmentName());
        return mapper.toResponse(complaint, List.of());
    }

    /** Reference code in the {@code CS-<year>-<number>} form shown to citizens. */
    private String nextReferenceCode() {
        return "CS-%d-%05d".formatted(Year.now().getValue(), complaintRepository.nextReferenceNumber());
    }

    // -------------------------------------------------------------------- read

    @Transactional(readOnly = true)
    public ComplaintResponse findById(Long id, boolean withComments) {
        Complaint complaint = require(id);
        currentUserService.assertCanView(complaint.getUser());
        return mapper.toResponse(complaint, withComments ? visibleComments(complaint, true) : List.of());
    }

    @Transactional(readOnly = true)
    public ComplaintResponse findByReferenceCode(String referenceCode) {
        Complaint complaint = complaintRepository.findByReferenceCode(referenceCode.trim())
                .orElseThrow(() -> ResourceNotFoundException.because("Şikayət tapılmadı: " + referenceCode));
        currentUserService.assertCanView(complaint.getUser());
        return mapper.toResponse(complaint, visibleComments(complaint, true));
    }

    /**
     * Search over the whole system for staff; citizens are transparently restricted to
     * their own complaints regardless of the filters they pass.
     */
    @Transactional(readOnly = true)
    public PageResponse<ComplaintResponse> search(SearchCriteria criteria, Pageable pageable) {
        User current = currentUserService.require();
        SearchCriteria effective = current.isStaff()
                ? withDefaults(criteria)
                : restrictToOwner(criteria, current.getId());

        Page<Complaint> page = complaintRepository.findAll(
                ComplaintSpecification.allOf(effective), pageable);
        return PageResponse.of(page.map(complaint -> mapper.toResponse(complaint, List.of())));
    }

    @Transactional(readOnly = true)
    public PageResponse<ComplaintResponse> findMine(Pageable pageable) {
        User current = currentUserService.require();
        Page<Complaint> page = complaintRepository.findByUserId(current.getId(), pageable);
        return PageResponse.of(page.map(complaint -> mapper.toResponse(complaint, List.of())));
    }

    @Transactional(readOnly = true)
    public PageResponse<ComplaintResponse> findAssignedToMe(Pageable pageable) {
        User current = currentUserService.require();
        Page<Complaint> page = complaintRepository.findAll(
                ComplaintSpecification.allOf(SearchCriteria.of(null, null, null, null,
                        current.getId(), null, null, null, null, null, null)),
                pageable);
        return PageResponse.of(page.map(complaint -> mapper.toResponse(complaint, List.of())));
    }

    /** Lightweight payload for the map view. Staff only. */
    @Transactional(readOnly = true)
    public List<ComplaintMarkerResponse> markers(SearchCriteria criteria, int limit) {
        currentUserService.requireStaff();
        int capped = Math.min(Math.max(limit, 1), MAX_MARKERS);
        Pageable pageable = PageRequest.of(0, capped, Sort.by(Sort.Direction.DESC, "createdAt"));
        return complaintRepository.findAll(buildSpecification(criteria), pageable)
                .stream()
                .map(ComplaintMarkerResponse::of)
                .toList();
    }

    // ------------------------------------------------------------------ update

    @Transactional
    public ComplaintResponse update(Long id, ComplaintCreateRequest request) {
        Complaint complaint = requireForUpdate(id);
        currentUserService.assertCanModify(complaint.getUser());

        complaint.setTitle(request.title().trim());
        complaint.setDescription(request.description().trim());
        complaint.setImageUrl(blankToNull(request.imageUrl()));
        complaint.setLatitude(request.latitude());
        complaint.setLongitude(request.longitude());
        complaint.setDistrict(blankToNull(request.district()));
        complaint.setAddress(blankToNull(request.address()));
        if (request.priority() != null) {
            complaint.setPriority(request.priority());
        }
        complaint.setCategory(requireCategoryByName(request.categoryName()));
        complaint = complaintRepository.save(complaint);
        return mapper.toResponse(complaint, visibleComments(complaint, true));
    }

    @Transactional
    public ComplaintResponse assign(Long id, ComplaintAssignRequest request) {
        currentUserService.requireStaff();
        Complaint complaint = requireForUpdate(id);
        User assignee = currentUserService.requireAssignable(request.assigneeId());

        complaint.setAssignedTo(assignee);
        complaint = complaintRepository.save(complaint);
        log.info("Şikayət {} təyinatlandı: {}", complaint.getReferenceCode(), assignee.getUsername());
        return mapper.toResponse(complaint, visibleComments(complaint, true));
    }

    /**
     * Moves a complaint to a new status, enforcing the transition table. Reopening a closed
     * complaint is an admin-only action.
     */
    @Transactional
    public ComplaintResponse changeStatus(Long id, ComplaintStatusUpdateRequest request) {
        User current = currentUserService.require();
        Complaint complaint = requireForUpdate(id);
        Status target = request.status();

        if (complaint.getStatus() == target) {
            throw new ConflictException("Şikayət artıq " + target + " statusundadır");
        }
        boolean reopening = complaint.isClosed() && target.isOpen();
        if (reopening && current.getRole() != User.Role.ADMIN) {
            throw new com.example.cityservice.exception.ForbiddenException(
                    "Bağlı şikayəti yalnız administrator yenidən aça bilər");
        }
        if (target.isOpen() && !current.isStaff() && !current.getId().equals(complaint.getUser().getId())) {
            throw new com.example.cityservice.exception.ForbiddenException(
                    "Bu şikayətin statusunu dəyişmək icazəniz yoxdur");
        }
        if (!complaint.allowedTransitions().contains(target)) {
            throw new InvalidStateTransitionException(
                    complaint.getStatus() + " -> " + target + " keçidi mümkün deyil",
                    complaint.allowedTransitions().stream().map(Enum::name).toList());
        }

        Status previous = complaint.getStatus();
        complaint.setStatus(target);
        String note = blankToNull(request.note());
        if (note != null) {
            complaint.setResolutionNote(note);
        }
        complaint.setResolvedAt(target.isClosed() ? Instant.now() : null);

        complaint = complaintRepository.save(complaint);

        recordStatusChange(complaint, current, previous, target, note);
        log.info("Şikayət {} status dəyişdi: {} -> {}", complaint.getReferenceCode(), previous, target);
        return mapper.toResponse(complaint, visibleComments(complaint, true));
    }

    @Transactional
    public ComplaintResponse cancel(Long id, String reason) {
        User current = currentUserService.require();
        Complaint complaint = requireForUpdate(id);
        if (!current.isStaff() && !current.getId().equals(complaint.getUser().getId())) {
            throw new com.example.cityservice.exception.ForbiddenException(
                    "Bu şikayəti ləğv etmək icazəniz yoxdur");
        }
        if (complaint.isClosed()) {
            throw new ConflictException("Bağlı şikayət ləğv edilə bilməz");
        }

        Status previous = complaint.getStatus();
        complaint.setStatus(Status.CANCELLED);
        complaint.setResolvedAt(Instant.now());
        complaint = complaintRepository.save(complaint);

        recordStatusChange(complaint, current, previous, Status.CANCELLED, blankToNull(reason));
        return mapper.toResponse(complaint, visibleComments(complaint, true));
    }

    // ---------------------------------------------------------------- comments

    @Transactional
    public ComplaintResponse addComment(Long id, CommentCreateRequest request) {
        User current = currentUserService.require();
        Complaint complaint = requireForUpdate(id);
        currentUserService.assertCanView(complaint.getUser());

        boolean internal = Boolean.TRUE.equals(request.internal());
        if (internal && !current.isStaff()) {
            throw new com.example.cityservice.exception.ForbiddenException(
                    "Daxili qeyd yalnız personal üçündür");
        }

        ComplaintComment comment = ComplaintComment.builder()
                .message(request.message().trim())
                .internal(internal)
                .complaint(complaint)
                .author(current)
                .build();
        commentRepository.save(comment);

        return mapper.toResponse(complaint, visibleComments(complaint, true));
    }

    // ------------------------------------------------------------------ delete

    @Transactional
    public void delete(Long id) {
        currentUserService.requireAdmin();
        Complaint complaint = require(id);
        complaintRepository.delete(complaint);
    }

    // ----------------------------------------------------------------- helpers

    private Complaint require(Long id) {
        return complaintRepository.findById(id)
                .orElseThrow(() -> ResourceNotFoundException.of("Şikayət", id));
    }

    /** Row lock so concurrent staff updates cannot overwrite each other. */
    private Complaint requireForUpdate(Long id) {
        return complaintRepository.findByIdForUpdate(id)
                .orElseThrow(() -> ResourceNotFoundException.of("Şikayət", id));
    }

    private Category requireCategoryByName(String name) {
        return categoryRepository.findByNameIgnoreCase(name.trim())
                .filter(Category::isActive)
                .orElseThrow(() -> ResourceNotFoundException.because("Kateqoriya tapılmadı: " + name));
    }

    private void recordStatusChange(Complaint complaint, User author, Status previous, Status target,
                                    String note) {
        ComplaintComment comment = ComplaintComment.builder()
                .message(note == null ? ("Status dəyişdi: " + previous + " -> " + target) : note)
                .previousStatus(previous)
                .newStatus(target)
                .internal(false)
                .complaint(complaint)
                .author(author)
                .build();
        commentRepository.save(comment);
    }

    /** Internal notes stay hidden from citizens. */
    private List<ComplaintComment> visibleComments(Complaint complaint, boolean withComments) {
        if (!withComments) {
            return List.of();
        }
        List<ComplaintComment> comments = new ArrayList<>(
                commentRepository.findByComplaintIdOrderByCreatedAtAsc(complaint.getId()));
        if (!currentUserService.isStaff()) {
            comments.removeIf(ComplaintComment::isInternal);
        }
        return comments;
    }

    private SearchCriteria withDefaults(SearchCriteria criteria) {
        return criteria == null ? SearchCriteria.empty() : criteria;
    }

    /** Forces the owner filter and drops staff-only parameters for citizens. */
    private SearchCriteria restrictToOwner(SearchCriteria criteria, Long ownerId) {
        SearchCriteria source = withDefaults(criteria);
        return SearchCriteria.of(null, source.priority(), null, ownerId, null, null, null, null,
                source.text(), source.createdFrom(), source.createdTo());
    }

    private Specification<Complaint> buildSpecification(SearchCriteria criteria) {
        return ComplaintSpecification.allOf(withDefaults(criteria));
    }

    private static String blankToNull(String value) {
        if (value == null) {
            return null;
        }
        String trimmed = value.trim();
        return trimmed.isEmpty() ? null : trimmed;
    }
}