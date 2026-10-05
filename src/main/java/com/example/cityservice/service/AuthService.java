package com.example.cityservice.service;

import com.example.cityservice.dto.AuthResponse;
import com.example.cityservice.dto.LoginRequest;
import com.example.cityservice.dto.RegisterRequest;
import com.example.cityservice.exception.ConflictException;
import com.example.cityservice.model.User;
import com.example.cityservice.repository.UserRepository;
import com.example.cityservice.security.JwtService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/** Registration and login. */
@Service
public class AuthService {

    private static final Logger log = LoggerFactory.getLogger(AuthService.class);

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final AuthenticationManager authenticationManager;
    private final JwtService jwtService;

    public AuthService(UserRepository userRepository,
                       PasswordEncoder passwordEncoder,
                       AuthenticationManager authenticationManager,
                       JwtService jwtService) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.authenticationManager = authenticationManager;
        this.jwtService = jwtService;
    }

    /** Self-service registration always produces a citizen account. */
    @Transactional
    public AuthResponse register(RegisterRequest request) {
        String username = request.username().trim();
        String email = request.email().trim().toLowerCase();

        if (userRepository.existsByUsernameIgnoreCase(username)) {
            throw new ConflictException("Bu istifadəçi adı artıq tutulub: " + username);
        }
        if (userRepository.existsByEmailIgnoreCase(email)) {
            throw new ConflictException("Bu email artıq istifadə olunub: " + email);
        }

        User user = User.builder()
                .username(username)
                .email(email)
                .password(passwordEncoder.encode(request.password()))
                .fullName(blankToNull(request.fullName()))
                .phoneNumber(blankToNull(request.phoneNumber()))
                .role(User.Role.CITIZEN)
                .active(true)
                .build();
        user = userRepository.save(user);

        log.info("Yeni qeydiyyat: {}", username);
        return AuthResponse.of(jwtService.issue(user), jwtService.expiresInSeconds(), user);
    }

    @Transactional(readOnly = true)
    public AuthResponse login(LoginRequest request) {
        String username = request.username().trim();
        try {
            authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(username, request.password()));
        } catch (BadCredentialsException ex) {
            throw new BadCredentialsException("İstifadəçi adı və ya parol düzgün deyil");
        }

        User user = userRepository.findByUsernameIgnoreCase(username)
                .orElseThrow(() -> new BadCredentialsException("İstifadəçi adı və ya parol düzgün deyil"));

        if (!user.isActive()) {
            throw new BadCredentialsException("Hesab deaktivləşdirilib");
        }

        return AuthResponse.of(jwtService.issue(user), jwtService.expiresInSeconds(), user);
    }

    private static String blankToNull(String value) {
        if (value == null) {
            return null;
        }
        String trimmed = value.trim();
        return trimmed.isEmpty() ? null : trimmed;
    }
}