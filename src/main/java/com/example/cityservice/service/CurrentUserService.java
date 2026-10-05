package com.example.cityservice.service;

import com.example.cityservice.exception.ForbiddenException;
import com.example.cityservice.exception.ResourceNotFoundException;
import com.example.cityservice.model.Complaint;
import com.example.cityservice.model.User;
import com.example.cityservice.repository.UserRepository;
import com.example.cityservice.security.AppUserDetails;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * Single place that answers "who is calling?" so authorisation rules stay consistent
 * between the controller and service layers.
 */
@Service
public class CurrentUserService {

    private final UserRepository userRepository;

    public CurrentUserService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    @Transactional(readOnly = true)
    public User require() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !authentication.isAuthenticated()) {
            throw new ForbiddenException("İstifadəçi kimliyi tələb olunur");
        }
        if (authentication.getPrincipal() instanceof AppUserDetails details) {
            return userRepository.findById(details.getId())
                    .orElseThrow(() -> ResourceNotFoundException.of("İstifadəçi", details.getId()));
        }
        throw new ForbiddenException("İstifadəçi kimliyi tələb olunur");
    }

    @Transactional(readOnly = true)
    public User requireAdmin() {
        User user = require();
        if (user.getRole() != User.Role.ADMIN) {
            throw new ForbiddenException("Bu əməliyyat yalnız administrator üçündür");
        }
        return user;
    }

    public boolean isStaff() {
        return require().isStaff();
    }

    @Transactional(readOnly = true)
    public User requireStaff() {
        User user = require();
        if (!user.isStaff()) {
            throw new ForbiddenException("Bu əməliyyat yalnız personal üçündür");
        }
        return user;
    }

    /** Citizens may only read their own complaints; staff may read everything. */
    public void assertCanView(User owner) {
        User current = require();
        if (current.isStaff() || current.getId().equals(owner.getId())) {
            return;
        }
        throw new ForbiddenException("Bu şikayəti görmək icazəniz yoxdur");
    }

    /** Only the owner may cancel or comment on a complaint they filed. */
    public void assertCanModify(User owner) {
        User current = require();
        if (current.isStaff() || current.getId().equals(owner.getId())) {
            return;
        }
        throw new ForbiddenException("Bu şikayəti dəyişmək icazəniz yoxdur");
    }

    /** Rejects an inactive account, e.g. when staff is assigned a complaint. */
    @Transactional(readOnly = true)
    public User requireAssignable(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> ResourceNotFoundException.of("İstifadəçi", userId));
        if (!user.isActive()) {
            throw new ForbiddenException("Deaktiv istifadəçiyə təyinat edilə bilməz: " + user.getUsername());
        }
        return user;
    }

    public boolean isOwner(Complaint complaint) {
        return require().getId().equals(complaint.getUser().getId());
    }
}