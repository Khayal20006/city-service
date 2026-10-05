package com.example.cityservice.repository;

import java.util.List;
import java.util.Optional;

import com.example.cityservice.model.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface UserRepository extends JpaRepository<User, Long> {

    Optional<User> findByUsernameIgnoreCase(String username);

    Optional<User> findByEmailIgnoreCase(String email);

    boolean existsByUsernameIgnoreCase(String username);

    boolean existsByEmailIgnoreCase(String email);

    boolean existsByRole(User.Role role);

    List<User> findAllByRole(User.Role role);

    long countByRole(User.Role role);

    @Query("""
            select u from User u
            where (:username is null or lower(u.username) like lower(concat('%', :username, '%')))
              and (:role is null or u.role = :role)
            """)
    Page<User> search(@Param("username") String username, @Param("role") User.Role role, Pageable pageable);
}