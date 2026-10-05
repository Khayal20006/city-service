package com.example.cityservice.security;

import com.example.cityservice.exception.ResourceNotFoundException;
import com.example.cityservice.model.User;
import com.example.cityservice.repository.UserRepository;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class CityUserDetailsService implements UserDetailsService {

    private final UserRepository userRepository;

    public CityUserDetailsService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    @Override
    @Transactional(readOnly = true)
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
        return new AppUserDetails(loadEntity(username));
    }

    @Transactional(readOnly = true)
    public User loadEntity(String username) throws UsernameNotFoundException {
        return userRepository.findByUsernameIgnoreCase(username)
                .orElseThrow(() -> new UsernameNotFoundException("İstifadəçi tapılmadı: " + username));
    }

    /**
     * Not part of the {@link UserDetailsService} contract, so it reports a missing id as a
     * 404 instead of an authentication failure.
     */
    @Transactional(readOnly = true)
    public User loadEntityById(Long id) {
        return userRepository.findById(id)
                .orElseThrow(() -> ResourceNotFoundException.of("İstifadəçi", id));
    }
}