package com.example.cityservice.service;

import java.util.List;

import com.example.cityservice.dto.CategoryRequest;
import com.example.cityservice.dto.CategoryResponse;
import com.example.cityservice.exception.ConflictException;
import com.example.cityservice.exception.ResourceNotFoundException;
import com.example.cityservice.model.Category;
import com.example.cityservice.model.Complaint.Status;
import com.example.cityservice.repository.CategoryRepository;
import com.example.cityservice.repository.ComplaintRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/** Complaint categories. Read access is public, writes are admin-only. */
@Service
public class CategoryService {

    private static final List<Status> OPEN_STATUSES =
            List.of(Status.PENDING, Status.UNDER_REVIEW, Status.IN_PROGRESS);

    private final CategoryRepository categoryRepository;
    private final ComplaintRepository complaintRepository;
    private final CurrentUserService currentUserService;

    public CategoryService(CategoryRepository categoryRepository,
                           ComplaintRepository complaintRepository,
                           CurrentUserService currentUserService) {
        this.categoryRepository = categoryRepository;
        this.complaintRepository = complaintRepository;
        this.currentUserService = currentUserService;
    }

    /** Public listing used by the complaint form. */
    @Transactional(readOnly = true)
    public List<CategoryResponse> findAll(boolean onlyActive) {
        List<Category> categories = onlyActive
                ? categoryRepository.findAllByActiveTrueOrderByNameAsc()
                : categoryRepository.findAllByOrderByNameAsc();
        return categories.stream().map(this::toResponse).toList();
    }

    @Transactional(readOnly = true)
    public CategoryResponse findById(Long id) {
        return toResponse(require(id));
    }

    @Transactional
    public CategoryResponse create(CategoryRequest request) {
        currentUserService.requireAdmin();
        String name = request.name().trim();
        if (categoryRepository.existsByNameIgnoreCase(name)) {
            throw new ConflictException("Bu kateqoriya artıq mövcuddur: " + name);
        }
        Category category = request.applyTo(Category.builder().build());
        if (request.active() != null) {
            category.setActive(request.active());
        }
        return toResponse(categoryRepository.save(category));
    }

    @Transactional
    public CategoryResponse update(Long id, CategoryRequest request) {
        currentUserService.requireAdmin();
        Category category = require(id);
        String name = request.name().trim();
        categoryRepository.findByNameIgnoreCase(name)
                .filter(existing -> !existing.getId().equals(id))
                .ifPresent(existing -> {
                    throw new ConflictException("Bu kateqoriya artıq mövcuddur: " + name);
                });
        return toResponse(categoryRepository.save(request.applyTo(category)));
    }

    /**
     * Categories are referenced by complaints, so they are deactivated instead of deleted
     * to keep historical reports intact.
     */
    @Transactional
    public void deactivate(Long id) {
        currentUserService.requireAdmin();
        Category category = require(id);
        long open = complaintRepository.countByCategoryIdAndStatusIn(id, OPEN_STATUSES);
        if (open > 0) {
            throw new ConflictException("Açıq şikayəti olan kateqoriya deaktivləşdirilə bilməz (" + open + ")");
        }
        category.setActive(false);
        categoryRepository.save(category);
    }

    private Category require(Long id) {
        return categoryRepository.findById(id)
                .orElseThrow(() -> ResourceNotFoundException.of("Kateqoriya", id));
    }

    private CategoryResponse toResponse(Category category) {
        long open = complaintRepository.countByCategoryIdAndStatusIn(category.getId(), OPEN_STATUSES);
        return CategoryResponse.of(category, open);
    }
}