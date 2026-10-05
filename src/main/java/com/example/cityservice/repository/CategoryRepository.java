package com.example.cityservice.repository;

import java.util.List;
import java.util.Optional;

import com.example.cityservice.model.Category;
import org.springframework.data.jpa.repository.JpaRepository;

public interface CategoryRepository extends JpaRepository<Category, Long> {

    Optional<Category> findByNameIgnoreCase(String name);

    boolean existsByNameIgnoreCase(String name);

    List<Category> findAllByActiveTrueOrderByNameAsc();

    List<Category> findAllByOrderByNameAsc();
}